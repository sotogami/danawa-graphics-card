document.addEventListener("DOMContentLoaded", function () {
    // 장바구니 정보를 가져와 표시하는 함수
    async function getUserCart() {
        try {
            const response = await fetch("/getUserCart");
            const data = await response.json();

            console.log("User Cart Data:", data); // 추가한 부분

            if (data.success) {
                const userCart = data.userCart;

                // 갱신된 부분: 장바구니 데이터가 있을 때와 없을 때의 처리
                if (userCart.length > 0) {
                    // 장바구니가 비어있지 않으면 테이블에 데이터를 표시
                    displayUserCart(userCart);
                } else {
                    // 장바구니가 비어있으면 메시지를 표시
                    displayEmptyCartMessage();
                }
            } else {
                console.error("사용자 장바구니 정보를 가져오지 못했습니다.");
                displayEmptyCartMessage();
            }
        } catch (error) {
            console.error("오류 발생:", error);
            displayEmptyCartMessage();
        }
    }

    // 장바구니가 비어있을 때 메시지를 표시하는 함수
    function displayEmptyCartMessage() {
        const detailsContainer = document.getElementById("details2");
        const emptyCartMessage = document.createElement("div");
        emptyCartMessage.id = "empty-cart-message";
        emptyCartMessage.style.textAlign = "center";
        emptyCartMessage.style.padding = "20px";
        emptyCartMessage.innerHTML = "장바구니가 비어있습니다.";
        detailsContainer.appendChild(emptyCartMessage);
    }

    // 갱신된 부분: 장바구니 정보를 테이블에 표시하는 함수
    function displayUserCart(userCart) {
        const detailsContainer = document.getElementById("details2");

        // 기존에 표시된 내용을 지우고 새로운 내용으로 갱신
        detailsContainer.innerHTML = "";

        // 각 상품 정보를 반복하여 테이블에 추가
        userCart.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("item");

            const itemDetailsDiv = document.createElement("div");
            itemDetailsDiv.classList.add("item-details");

            // 각 열에 대한 정보를 추가
            const price = parseFloat(item.price); // 변경된 부분
            itemDetailsDiv.innerHTML = `
                <div>상품명: ${item.gpu_name}</div>
                <div>판매가: ${(!isNaN(price) ? price.toFixed(2) : "N/A")}</div>
                <div class="quantity">수량: ${item.quantity}</div>
                <div class="order-amount">주문금액: ${(!isNaN(price) ? (price * item.quantity).toFixed(2) : "N/A")}</div>
            `;

            const optionsDiv = document.createElement("div");
            optionsDiv.classList.add("options");

            // 여기에서 옵션 버튼 및 삭제 버튼을 추가하세요
            optionsDiv.innerHTML = `
                <button>옵션/수량</button>
                <button onclick="deleteItem(${item.cart_id})">삭제하기</button>
            `;

            // 각 열을 부모 컨테이너에 추가
            itemDiv.appendChild(itemDetailsDiv);
            itemDiv.appendChild(optionsDiv);
            detailsContainer.appendChild(itemDiv);
        });
    }

    // 페이지 로드 시 장바구니 정보를 가져와서 표시
    getUserCart();
});

// 삭제 버튼을 눌렀을 때 해당 상품을 장바구니에서 삭제하는 함수
async function deleteItem(cartId) {
    try {
        const response = await fetch(`/deleteCartItem/${cartId}`, { method: "DELETE" });
        const data = await response.json();

        if (data.success) {
            // 성공적으로 삭제되면 페이지 갱신
            getUserCart();
        } else {
            console.error("상품 삭제 실패:", data.message);
        }
    } catch (error) {
        console.error("오류 발생:", error);
    }
}
// 사용자가 이미 로그인되어 있다고 가정한 상태
const user_id = '123'; // 로그인한 사용자의 ID

// 주문하기 버튼을 눌렀을 때 호출되는 함수
async function placeOrder() {
  try {
    const userCart = await getUserCart();

    const response = await fetch('/placeOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user_id, // 수정: loggedInUserId -> user_id
        orderItems: userCart,
      }),
    });

    const data = await response.json();

    if (data.success) {
      updateMyPage();
      alert(`주문이 완료되었습니다. 주문한 상품 갯수: ${userCart.length}`);
    } else {
      alert('주문 실패하였습니다.');
    }
  } catch (error) {
    console.error('오류 발생:', error);
    alert('주문 처리 중 오류가 발생했습니다.');
  }
}
  // 장바구니 정보를 가져오는 함수
  async function getUserCart() {
    try {
      const response = await fetch('/api/getUserCart');
      const data = await response.json();
  
      if (data.success) {
        return data.userCart; // 장바구니 정보 반환
      } else {
        console.error('장바구니 정보를 가져오지 못했습니다.');
        return []; // 실패 시 빈 배열 반환 또는 다른 적절한 처리
      }
    } catch (error) {
      console.error('오류 발생:', error);
      return []; // 오류 시 빈 배열 반환 또는 다른 적절한 처리
    }
  }
  
 
  
