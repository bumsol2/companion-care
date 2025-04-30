import nodemailer from 'nodemailer';

/**
 * Nodemailer 트랜스포터 설정
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

/**
 * 간단한 이메일 템플릿 생성
 * @param {Object} data - 템플릿에 적용할 데이터
 * @returns {string} - 생성된 HTML 템플릿
 */
function generateEmailTemplate(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>케어 알림</title>
  <style>
    body { font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 8px; }
    .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>케어 알림</h1>
    </div>
    <div class="content">
      <p><strong>${data.userName}</strong>님, 안녕하세요!</p>
      <p><strong>${data.petName}</strong>의 <strong>${data.careType}</strong> 일정이 있어요.</p>
      <p>날짜: <strong>${data.careDate}</strong></p>
      <p>케어를 완료하셨다면 아래 버튼을 눌러주세요.</p>
      <a href="${data.completeUrl}" class="button">완료 확인하기</a>
    </div>
    <div class="footer">
      <p>이 이메일은 Companion Care에서 발송되었습니다.</p>
      <p><a href="${data.appUrl}">앱으로 이동하기</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 케어 알림 이메일 발송
 * @param {Object} options - 이메일 옵션
 * @param {string} options.to - 수신자 이메일
 * @param {string} options.userName - 사용자 이름
 * @param {Object} options.pet - 반려 생물 정보
 * @param {Object} options.care - 케어 일정 정보
 * @param {string} options.completeUrl - 케어 완료 URL
 * @param {string} options.appUrl - 앱 URL
 * @returns {Promise<Object>} - 이메일 발송 결과
 */
export async function sendCareReminderEmail(options) {
  try {
    // 템플릿 생성
    const html = generateEmailTemplate({
      userName: options.userName || '사용자',
      petName: options.pet.name,
      petType: options.pet.type,
      careType: options.care.care_type,
      careDate: new Date(options.care.next_date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
      completeUrl: options.completeUrl,
      appUrl: options.appUrl,
    });

    // 이메일 발송
    const info = await transporter.sendMail({
      from: `"Companion Care" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: `[케어 알림] ${options.pet.name}의 ${options.care.care_type} 일정이 있어요!`,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('이메일 발송 에러:', error);
    return { success: false, error };
  }
}

/**
 * 이메일 발송 테스트
 * @returns {Promise<boolean>} - 이메일 발송 성공 여부
 */
export async function testEmailConnection() {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('이메일 서버 연결 테스트 실패:', error);
    return false;
  }
}

/**
 * 재시도 로직을 포함한 이메일 발송
 * @param {Function} sendFunction - 이메일 발송 함수
 * @param {Array} args - 발송 함수에 전달할 인자
 * @param {number} maxRetries - 최대 재시도 횟수 (기본값: 3)
 * @param {number} delay - 재시도 간 지연 시간(ms) (기본값: 1000)
 * @returns {Promise<Object>} - 이메일 발송 결과
 */
export async function sendWithRetry(sendFunction, args, maxRetries = 3, delay = 1000) {
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      const result = await sendFunction(...args);
      if (result.success) {
        return result;
      }
      lastError = result.error;
    } catch (error) {
      lastError = error;
    }

    retries++;
    if (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return { success: false, error: lastError, retries };
}
