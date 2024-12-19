var imgArray = new Array();
imgArray[0] = "images/GCI/ASUS_RTX_3060.jpg";
imgArray[1] = "images/GCI/ASUS_RTX_3070.jpg";
imgArray[2] = "images/GCI/ASUS_RTX_3080.jpg";

imgArray[3] = "images/GCI/GLX_RTX_3060.jpg";
imgArray[4] = "images/GCI/GLX_RTX_3070.jpg";
imgArray[5] = "images/GCI/GLX_RTX_3080.jpg";

imgArray[6] = "images/GCI/MSI_RTX_3060.jpg";
imgArray[7] = "images/GCI/MSI_RTX_3070.jpg";
imgArray[8] = "images/GCI/MSI_RTX_3080.jpg";

imgArray[9] = "images/GCI/GB_RX_7600.jpg";
imgArray[10] = "images/GCI/GB_RX_7700.jpg";
imgArray[11] = "images/GCI/GB_RX_7800.jpg";

imgArray[12] = "images/GCI/SPX_RX_7600.jpg";
imgArray[13] = "images/GCI/SPX_RX_7700.jpg";
imgArray[14] = "images/GCI/SPX_RX_7800.jpg";

imgArray[15] = "images/GCI/XFX_RX_7600.jpg";
imgArray[16] = "images/GCI/XFX_RX_7700.jpg";
imgArray[17] = "images/GCI/XFX_RX_7800.jpg";

var nmArray = new Array();
nmArray[0] = "ASUS RTX 3060";
nmArray[1] = "ASUS RTX 3070";
nmArray[2] = "ASUS RTX 3080";

nmArray[3] = "GLX RTX 3060";
nmArray[4] = "GLX RTX 3070";
nmArray[5] = "GLX RTX 3080";

nmArray[6] = "MSI RTX 3060";
nmArray[7] = "MSI RTX 3070";
nmArray[8] = "MSI RTX 3080";

nmArray[9] = "GB RX 7600";
nmArray[10] = "GB RX 7700";
nmArray[11] = "GB RX 7800";

nmArray[12] = "SPX RX 7600";
nmArray[13] = "SPX RX 7700";
nmArray[14] = "SPX RX 7800";

nmArray[15] = "XFX RX 7600";
nmArray[16] = "XFX RX 7700";
nmArray[17] = "XFX RX 7800";

function showImage(){
	var firstNum = Math.round(Math.random()*17);
	var secondNum = Math.round(Math.random()*17);
	if (secondNum == firstNum){
		while(true){
			if(secondNum != firstNum){
				break;
			}
			secondNum = Math.round(Math.random()*17);
		};
	};
	var thirdNum = Math.round(Math.random()*17);
	var fourthNum = Math.round(Math.random()*17);
	if (fourthNum == thirdNum){
		while(true){
			if(fourthNum != thirdNum){
				break;
			}
			fourthNum = Math.round(Math.random()*17);
		};
	};
	var fifthNum = Math.round(Math.random()*17);
	var sixthNum = Math.round(Math.random()*17);
	if (sixthNum == fifthNum){
		while(true){
			if(sixthNum != fifthNum){
				break;
			}
			sixthNum = Math.round(Math.random()*17);
		};
	};
	//1
	var objImg1 = document.getElementById("introImg1");
	objImg1.src = imgArray[firstNum];
	var objnm1 = document.getElementById("imgtag1");
	objnm1.innerText = nmArray[firstNum]
	var objImg2 = document.getElementById("introImg2");
	objImg2.src = imgArray[secondNum];
	var objnm2 = document.getElementById("imgtag2");
	objnm2.innerText = nmArray[secondNum]
	//2
	var objImg3 = document.getElementById("introImg3");
	objImg3.src = imgArray[thirdNum];
	var objnm3 = document.getElementById("imgtag3");
	objnm3.innerText = nmArray[thirdNum]
	var objImg4 = document.getElementById("introImg4");
	objImg4.src = imgArray[fourthNum];
	var objnm4 = document.getElementById("imgtag4");
	objnm4.innerText = nmArray[fourthNum]
	//3
	var objImg5 = document.getElementById("introImg5");
	objImg5.src = imgArray[fifthNum];
	var objnm5 = document.getElementById("imgtag5");
	objnm5.innerText = nmArray[fifthNum]
	var objImg6 = document.getElementById("introImg6");
	objImg6.src = imgArray[sixthNum];
	var objnm6 = document.getElementById("imgtag6");
	objnm6.innerText = nmArray[sixthNum]
}
