const endDateKey = 'countdownEndTime';
const endDate = new Date();

function initializeEndDate() {
    const storedTime = localStorage.getItem(endDateKey);
    if (storedTime) {
        endDate.setTime(parseInt(storedTime));
    } else {
        // 만약 저장된 시간이 없다면, 24시간 후로 설정
        endDate.setHours(endDate.getHours() + 24);
    }
}

function updateCountdown() {
    const now = new Date();
    const timeDifference = endDate - now;

    if (timeDifference > 0) {
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // 남은 시간을 로컬 저장소에 저장
        localStorage.setItem(endDateKey, endDate.getTime());

        document.getElementById("countdown").innerHTML = formattedTime;
    } else {
        document.getElementById("countdown").innerHTML = "이벤트 종료";
        // 여기에 래플 종료 시 동작 추가
    }
}

// 초기 호출
initializeEndDate();
updateCountdown();

// 1초마다 업데이트
setInterval(updateCountdown, 1000);

// 래플 페이지에서 응모 버튼을 눌렀을 때의 로직
function enterRaffle() {
  // 버튼 비활성화
  document.getElementById('enterButton').disabled = true;

  // 서버로 응모 요청을 보냄
  fetch('/enterRaffle', { method: 'POST' })
      .then(response => response.text())
      .then(result => {
          // 응모 결과에 따라 처리
          console.log(result);
          // 예: 응모 성공 시에는 어떤 처리

          // 버튼 다시 활성화
          document.getElementById('enterButton').disabled = false;
      })
      .catch(error => {
          console.error('Error entering raffle:', error);
          alert('Error entering raffle');

          // 버튼 다시 활성화
          document.getElementById('enterButton').disabled = false;
      });
}


// 페이지 로드 시 래플 참여자 수를 가져와서 업데이트
function updateParticipantCount() {
  fetch('/raffleParticipants')
    .then(response => response.json())
    .then(data => {
      // 래플 참여자 수 업데이트
      const participantsElement = document.querySelector('.participants');
      participantsElement.textContent = `${data.participantCount}명 참여 중`;
    })
    .catch(error => console.error('Error updating participant count:', error));
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 초기 래플 참여자 수 업데이트
  updateParticipantCount();

  // 응모 버튼 클릭 이벤트 리스너 등록
  const enterButton = document.querySelector('.enter-button');
  enterButton.addEventListener('click', enterRaffle);
});

// 결과 확인 버튼 클릭 시 동작
function checkResult() {
  fetch('/drawWinnerNested') // 서버에 랜덤 당첨자 요청
    .then(response => {
      if (!response.ok) {
        throw new Error('서버 응답 실패');
      }
      return response.json();
    })
    .then(data => {
      // 결과를 화면에 표시
      displayWinner(data.winnerName);
    })
    .catch(error => {
      console.error('결과 확인 실패: ' + error.message);
      alert('결과 확인 실패');
    });
}


// 당첨자 정보를 화면에 표시하는 함수
function displayWinner(winnerName) {
  const winnerDisplay = document.getElementById('winner-display');
  winnerDisplay.textContent = `${winnerName}님 래플에 당첨되셨습니다!`;
}




