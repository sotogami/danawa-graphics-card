var averageStarsElement;
var selectedManufacturers = [];
var selectedChipsets = [];
var selectedMemorySizes = [];
var selectedAmdChipsets = [];
var checkbox;
document.addEventListener('DOMContentLoaded', function () {
    var productList = document.querySelector(".product-list");
    var productsPerPage = 24;
    var currentPage = 1;
    var currentSortOrder = 'asc';

    // 초기 로드 시 gpu_id로 정렬된 데이터 가져오기
    loadProductsByDefault(currentPage);

    async function updateFilters() {
        selectedManufacturers = getSelectedValues('.manufacturer-filter');
        selectedChipsets = getSelectedValues('.chipset-filter');
        selectedMemorySizes = getSelectedValues('.memory-filter');
    
        // 선택된 값을 문자열로 변환
        const manufacturersString = stringifySelectedValues(selectedManufacturers);
        const chipsetsString = stringifySelectedValues(selectedChipsets);
        const memorySizesString = stringifySelectedValues(selectedMemorySizes);
    
        // 필터링이 변경되면 서버에 새로운 데이터 요청
        try {
            const urlParams = [];
    
            if (manufacturersString) {
                urlParams.push(`manufacturers=${manufacturersString}`);
            }
            if (chipsetsString) {
                urlParams.push(`chipsets=${chipsetsString}`);
            }
            if (memorySizesString) {
                urlParams.push(`memorySizes=${memorySizesString}`);
            }
    
            const queryString = urlParams.join('&');
    
            // 선택된 필터가 하나라도 있는 경우에만 요청
            if (urlParams.length > 0) {
                const url = `/getFilteredProducts?${queryString}`;
                console.log('Request URL:', url);
    
                const response = await fetch(url);
                const data = await response.json();
                handleProductResponse(data);
            } else {
                console.log('No filters selected.');
                // 필터가 없는 경우에 대한 처리를 추가할 수 있습니다.
            }
        } catch (error) {
            console.error('필터링된 상품 데이터를 불러오는 도중 오류가 발생했습니다.', error);
        }
    }
    
    
    
    
    
    // "낮은가격순" 버튼 클릭 이벤트 핸들러
    document.querySelector('[data-sort="low-price"]').addEventListener('click', function () {
        console.log('낮은가격순 클릭');
        currentSortOrder = 'asc';
        fetch(`/getProducts?page=${currentPage}&sortOrder=${currentSortOrder}`)
            .then(response => response.json())
            .then(data => handleProductResponse(data))
            .catch(error => console.error('상품 데이터를 불러오는 도중 오류가 발생했습니다.', error));
    });

    // "높은가격순" 버튼 클릭 이벤트 핸들러
    document.querySelector('[data-sort="high-price"]').addEventListener('click', function () {
        console.log('높은가격순 클릭');
        currentSortOrder = 'desc';
        fetch(`/getProducts?page=${currentPage}&sortOrder=${currentSortOrder}`)
            .then(response => response.json())
            .then(data => handleProductResponse(data))
            .catch(error => console.error('상품 데이터를 불러오는 도중 오류가 발생했습니다.', error));
    });


        var checkboxes = document.querySelectorAll('.manufacturer-filter, .chipset-filter, .memory-filter');
        checkboxes.forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                updateFilters();
            });
        });

    
    
    // 가격대 필터링 함수
    window.filterByPrice = function () {
        updateQuery();
    };


// generateFilterParams 함수 수정
    function generateFilterParams() {
        let filterParams = `page=${currentPage}&sortOrder=${currentSortOrder}`;

        // 선택된 체크박스 값이 있다면 추가
        if (selectedManufacturers.length > 0) {
            filterParams += `&manufacturers=${selectedManufacturers.join(',')}`;
        }
        if (selectedChipsets.length > 0) {
            filterParams += `&chipsets=${selectedChipsets.join(',')}`;
        }
        if (selectedMemorySizes.length > 0) {
            filterParams += `&memorySizes=${selectedMemorySizes.join(',')}`;
        }

        // 최소 가격과 최대 가격이 입력되어 있다면 추가
        const minPriceElement = document.getElementById('minPrice');
        const maxPriceElement = document.getElementById('maxPrice');
        const minPrice = minPriceElement ? minPriceElement.value : '';
        const maxPrice = maxPriceElement ? maxPriceElement.value : '';
        if (minPrice) {
            filterParams += `&minPrice=${minPrice}`;
        }
        if (maxPrice) {
            filterParams += `&maxPrice=${maxPrice}`;
        }

        // asus 체크박스가 선택된 경우
        if (selectedManufacturers.length === 1 && selectedManufacturers[0].toLowerCase() === 'asus') {
            filterParams += `&asusFilter=true`;
        }

        return filterParams;
    }


    
    
    function updateQuery() {
        // 최소 가격과 최대 가격이 입력되어 있다면 추가
        const minPriceElement = document.getElementById('minPrice');
        const maxPriceElement = document.getElementById('maxPrice');
        const minPrice = minPriceElement ? minPriceElement.value : '';
        const maxPrice = maxPriceElement ? maxPriceElement.value : '';

        // 선택된 제조사 값이 있다면 추가
        const selectedManufacturers = getSelectedValues('.manufacturer-filter');
        const selectedChipsets = getSelectedValues('.chipset-filter');
        const selectedMemorySizes = getSelectedValues('.memory-filter');

        // 필터된 데이터를 가져오기 위한 URL 생성
        let filterParams = generateFilterParams();



        // 서버에 새로운 데이터 요청
        fetch(`/getFilteredProducts?${filterParams}`)
            .then(response => response.json())
            .then(data => handleProductResponse(data))
            .catch(error => console.error('필터링된 상품 데이터를 불러오는 도중 오류가 발생했습니다.', error));
    }
    function getSelectedValues(selector) {
        const selectedCheckboxes = document.querySelectorAll(`${selector}:checked`);
        return Array.from(selectedCheckboxes).map(checkbox => {
            return {
                manufacturer: checkbox.dataset.manufacturer,
                chipset: checkbox.dataset.chipset,
                memory: checkbox.dataset.memory
            };
        });
    }
    
    // 선택된 값을 문자열로 변환하는 함수 추가
function stringifySelectedValues(selectedValues) {
    const filteredValues = selectedValues.filter(value => (
        value.manufacturer || value.chipset || value.memory
    ));

    return filteredValues.map(value => {
        const params = [];

        if (value.manufacturer) {
            params.push(`${encodeURIComponent(value.manufacturer)}`);
        }
        if (value.chipset) {
            params.push(`${encodeURIComponent(value.chipset)}`);
        }
        if (value.memory) {
            params.push(`${encodeURIComponent(value.memory)}`);
        }

        return params.join('&');
    }).join('&');
}

    


    //댓글 별 평균 갯수 가져오기
    async function getAverageStars(productId) {
        try {
            const response = await fetch(`/getAverageStars?productId=${productId}`);
            const data = await response.json();
            return data.averageStars || 0;
        } catch (error) {
            console.error('평균 별점 데이터를 가져오는 도중 오류가 발생했습니다.', error);
            return 0;
        }
    }

    
    function loadProductsByDefault(page) {
        const minPriceElement = document.getElementById('minPrice');
        const maxPriceElement = document.getElementById('maxPrice');
        const minPrice = minPriceElement ? minPriceElement.value : '';
        const maxPrice = maxPriceElement ? maxPriceElement.value : '';
    
        // 선택된 필터 값을 URL에 포함시키기 위해 인코딩합니다.
        const encodedManufacturers = encodeURIComponent(selectedManufacturers.join(','));
        const encodedChipsets = encodeURIComponent(selectedChipsets.join(','));
        const encodedMemorySizes = encodeURIComponent(selectedMemorySizes.join(','));
    
        fetch(`/getProductsByDefault?page=${page}&manufacturers=${encodedManufacturers}&chipsets=${encodedChipsets}&memorySizes=${encodedMemorySizes}&minPrice=${minPrice}&maxPrice=${maxPrice}`)
            .then(response => response.json())
            .then(data => handleProductResponse(data))
            .catch(error => console.error('상품 데이터를 불러오는 도중 오류가 발생했습니다.', error));
    }
    
    
    



    function loadProducts(page, sortOrder) {
        var start = (page - 1) * productsPerPage;

        // 서버에서 해당 페이지의 제품 데이터 가져오기
        fetch(`/getProducts?page=${page}&sortOrder=${sortOrder || 'asc'}`)
            .then(response => response.json())
            .then(data => handleProductResponse(data))
            .catch(error => console.error('상품 데이터를 불러오는 도중 오류가 발생했습니다.', error));
    }

    async function handleProductResponse(data) {
        if (data && data.products) {
            var products = data.products;
            var totalPages = data.totalPages;
    
            productList.innerHTML = ""; // 이전 상품 지우기
    
            for (let i = 0; i < products.length; i++) {
                var product = products[i];
    
                var productDiv = document.createElement("div");
                productDiv.className = "product";
                productDiv.style.width = "30%";
                productDiv.style.margin = "0.5%";
    
                // 상품 이미지 추가
                var productImage = document.createElement("img");
                productImage.src = product.image_url;
                productImage.alt = product.gpu_name;
                productDiv.appendChild(productImage);
    
                // 상품명 추가
                var productName = document.createElement("h3");
                productName.textContent = product.gpu_name;
                productDiv.appendChild(productName);
    
                // 새로운 부분: 평균 별점 수 표시
                averageStarsElement = document.createElement("div");
                averageStarsElement.className = "star-rating";
                const averageStars = await getAverageStars(product.gpu_id);
                averageStarsElement.setAttribute('data-rating', averageStars); // 추가된 부분
                averageStarsElement.innerHTML = generateStarRatingHTML(averageStars);
                productDiv.appendChild(averageStarsElement);
    
                // 상품 가격 추가
                var productPrice = document.createElement("p");
                var price = parseFloat(product.price); // 문자열을 숫자로 변환
                var formattedPrice = !isNaN(price) ? price.toFixed(2) + "원" : "가격 정보 없음";
                productPrice.textContent = "가격: " + formattedPrice;
                productDiv.appendChild(productPrice);
    
                // "상세 보기" 버튼 추가
                var viewButton = document.createElement("button");
                viewButton.className = "view-button";
                viewButton.textContent = "상세 보기";
                // 상품 ID를 버튼에 저장
                viewButton.dataset.productId = product.gpu_id;
                viewButton.addEventListener('click', function () {
                    // 상세 페이지로 이동하는 함수 호출
                    const productId = this.dataset.productId;
                    navigateToProductDetail(productId);
                });
                productDiv.appendChild(viewButton);
                productList.appendChild(productDiv);
            }
    
            // 페이지 버튼 생성
            createPagination(totalPages);
            displayStarRating();
        } else {
            console.error('상품 데이터 형식이 올바르지 않습니다.');
        }
    }

    function createPagination(totalPages) {
        const paginationElement = document.getElementById('pagination');
        paginationElement.innerHTML = ""; // 페이지 번호 초기화

        for (let i = 1; i <= totalPages; i++) {
            const pageNumber = document.createElement('span');
            pageNumber.classList.add('page-number');
            pageNumber.setAttribute('data-page', i);
            pageNumber.textContent = i;

            pageNumber.addEventListener('click', function () {
                const page = parseInt(this.getAttribute('data-page'));
                currentPage = page;
                loadProducts(page, currentSortOrder); // 정렬 순서도 함께 전달
            });

            paginationElement.appendChild(pageNumber);
        }
    }

    // 최근 본 상품 목록을 가져오는 함수
    function getRecentlyViewedProducts() {
        var recentlyViewedProducts = localStorage.getItem('recentlyViewedProducts');
        return recentlyViewedProducts ? JSON.parse(recentlyViewedProducts) : [];
    }

    // 최근 본 상품 목록을 설정하는 함수
    function setRecentlyViewedProducts(products) {
        localStorage.setItem('recentlyViewedProducts', JSON.stringify(products));
    }

    function navigateToProductDetail(productId) {
        console.log('Product Id:', productId);
        // productId가 유효한 값인지 확인
        if (productId) {
            // productId를 사용하여 동적으로 URL을 생성
            const productDetailURL = `/product_detail.html?productId=${productId}`;

            // null 체크를 추가하여 'textContent'를 읽기 전에 확인
            const productNameElement = document.querySelector(`[data-product-id="${productId}"] h3`);
            const productName = productNameElement ? productNameElement.textContent : '상품 없음';

            addRecentlyViewedProduct(productId, productName);

            // 페이지 이동
            window.location.href = productDetailURL;
        } else {
            console.error('유효하지 않은 productId입니다.');
        }
        
    // 최근 본 상품을 추가하는 함수
    function addRecentlyViewedProduct(productId, productName) {
        // 최근 본 상품 목록을 가져옴
        var recentlyViewedProducts = getRecentlyViewedProducts();

        // 최근 본 상품 목록에 상품 추가
        recentlyViewedProducts.unshift({ id: productId, name: productName });

        // 최근 본 상품 목록을 쿠키에 저장 (최대 3개 유지)
        setRecentlyViewedProducts(recentlyViewedProducts.slice(0, 3));

        // Mypage.html에 최근 본 상품 표시
        updateRecentlyViewedProductsOnMypage(recentlyViewedProducts);
    }

    // 최근 본 상품을 Mypage.html에 표시하는 함수
    function updateRecentlyViewedProductsOnMypage(recentlyViewedProducts) {
        var recentlyViewedBox = document.getElementById('recently-viewed-box');
        // 최근 본 상품 목록을 순회하면서 화면에 추가
        for (const product of recentlyViewedProducts) {
            const productDiv = document.createElement("div");
            productDiv.textContent = product.name;
            
        
            if (recentlyViewedBox) {
                recentlyViewedBox.innerHTML = '<div class="sub-box-title">최근 본 상품</div>';
                recentlyViewedBox.appendChild(productDiv);
            } else {
                console.error('recently-viewed-box를 찾을 수 없습니다.');
            }
        }
    }


    }
    async function displayStarRating() {
        const starRatingElements = document.querySelectorAll('.star-rating');
        for (const element of starRatingElements) {
            const rating = parseFloat(element.dataset.rating) || 0;
            element.innerHTML = await generateStarRatingHTML(rating);
        }
    }

// generateStarRatingHTML 함수 수정
async function generateStarRatingHTML(rating) {
    const maxStars = 5;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;

    // 별 모양의 HTML 생성
    let starHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starHTML += '<span class="star full">&#9733;</span>'; // 노란색 별 모양
    }
    if (halfStar) {
        starHTML += '<span class="star half">&#9733;</span>'; // 반채워진 노란색 별 모양
    }
    const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starHTML += '<span class="star">&#9734;</span>'; // 빈 별 모양
    }

    return starHTML;
}
});
