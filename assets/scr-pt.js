function reloadPage() { // Reloads Page upon Clicking
	window.location.reload(true)
} // Reloads Page upon Clicking

function randomStrGen(length) { // Random String Generator
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
} // Random String Generator

function getCurrentDate() { // Returns current Date and Time - UTC
	let currentdate = new Date();

	let datetime = currentdate.getUTCDate() + "/" + (currentdate.getUTCMonth() + 1) + "/" + currentdate.getUTCFullYear() + " - " + currentdate.getUTCHours() + ":" + currentdate.getUTCMinutes() + ":" + currentdate.getUTCSeconds();

	return datetime;

} // Returns current Date and Time - UTC





async function submitTrackingCode() { // Submitting and Processing the Submitted Tracking Codes

	console.log(`%cSuccessfully Ran submitTrackingCode() - ` + `%cFetching Parcel Tracking Code from Input Field`, 'color: #bada55', 'color: #1a80e5')

	let submitButton = document.querySelector('#submitBtn');
	let submitInput = document.querySelector('#textInput');

	submitInput.disabled = true;
	submitButton.disabled = true;

	let uncheckedCode = submitInput.value

	let isValid = await isValidTrackingCode(uncheckedCode);

	if (isValid === true) {
		IPSTParcelLookup(uncheckedCode);

	} else if (isValid === false) {
		errorMessages('notValidTrackingCode', uncheckedCode)

	} else {
		errorMessages('unexpectedValidCheck', uncheckedCode, isValid)
	}

} // Submitting and Processing the Submitted Tracking Codes

function isValidTrackingCode(code) { // Is the Submitted String a valid InPost Tracking Code
	console.log(`isValidTrackingCode`)
	const pattern = /^[mM][dD]\d{15}$/;
	console.log(pattern.test(code))
	console.log(`AFTER`)

	return pattern.test(code);
} // Is the Submitted String a valid InPost Tracking Code

async function IPSTParcelLookup(testValue) {

	console.log(testValue)
	console.log(`%cTracking Code (` + `%c${testValue}` + `%c) passed through into IPSTParcelLookup()`, 'color: #bada55', 'color: #1a80e5', 'color: #bada55')

	const resp = await fetch(`https://tracking.inpost.co.uk/api/v2.0/${testValue}`, {
		method: 'GET'
	}).then((response) => {
		return response.text();
	})

	let outputDiv = document.getElementById('outputDiv');

	if (resp.includes("error") === false) { // Valid - Doesnt contain Error

		let replaced = resp.replaceAll(testValue, `data`);
		let jsonParsed = JSON.parse(replaced);
		var resArr = []
		var unknownCodes = []
		var badCodes = ['PRS', 'LEX']
		var goodCodes = ['LTD', 'LCC', 'PSC', 'PPU']

		jsonParsed.data.forEach((res) => {
			var isType = ''
			let messageBodyContent = ''
			let randStr = randomStrGen(5)

			if (res.remark.length !== 0) { // If has a remark add to Response
				let messageBodyContent = `${res.remark}  -  `
			}



			if (goodCodes.includes(res.code)) {
				var isType = 'success';
			} else if (badCodes.includes(res.code)) {
				var isType = 'danger';
			} else {
				var isType = 'warning';
			}

			let resContentPush = {
				"code": res.code,
				"description": res.description,
				"timestamp": res.ts,
				"remark": res.remark,
				"html": `<article class="message is-${isType}" id="outputDiv-${randStr}">
            <div class="message-header">
  <p class="bold">(${res.code}) - ${res.description}</p>
  </div>
  <div id="msg-text2" class="message-body">
  ${messageBodyContent}
 <span style="font-size: 10px">Timestamp: ${res.ts}</span>
  
  </div>
</article>`
			}


			console.log(resContentPush)
			resArr.push(resContentPush)


			let knownCodes = ['PSC', 'PPU', 'CSO', 'HSI', 'DSI', 'POW', 'LTD', 'LCC', 'PRS', 'LEX', 'PRD']

			if (!knownCodes.includes(res.code)) {
				unknownCodes.push(res.code)

			}


		})

		resArr.reverse();
		resArr.forEach((element) => {

			outputDiv.insertAdjacentHTML("afterend", element.html);

		})

		if (unknownCodes.length !== 0) {
			swal({
				title: "! PLEASE DO NOT IGNORE !",
				text: `Parcel has Status Code(s) that we havent seen yet, Please contact me @ bit.ly/ContactInPostTools - Code(s): ${unknownCodes}`,
				icon: `https://i.ibb.co/1Zt7cWf/In-Post-Tools-Contact.png`,
				closeOnClickOutside: true
			})


		}



	} else if (resp.includes("error") === true) { // Not Valid - Contains Error

		let replaced = resp.replaceAll(testValue, `resp`);
		let jsonParsed = JSON.parse(replaced);
		let errorString = jsonParsed.resp.error.substring(0, jsonParsed.resp.error.length - 5); // No events found for consignment

		errorMessages('notValidTrackingCode-PassedCheck', testValue, errorString)


	} else { // Something Unexpected has gone wrong

		errorMessages('notValidTrackingCode-PassedCheckUnexpected', testValue, resp)

	}




}





function errorMessages(error, value, value2) { // Error Messages 


	let outputDiv = document.getElementById('outputDiv');
  let dateToday = getCurrentDate()
  let randStr = randomStrGen(5)
	let obfuscated = btoa(`${error}-${value}-${value2}-${dateToday}`) // NOTE: THIS IS NOT TO ENCRYPT THE DATA - ONLY TO OBFUSCATE


	switch (error) {
		case 'notValidTrackingCode':


			var html = `
<article class="message is-danger" id="outputDiv-${randStr}">
  <div class="message-header">
  <p class="bold">ERROR - Not a Valid Tracking Code</p>
  </div>
  <div id="msg-text2" class="message-body">
  Please <a href="https://https://SamJones04.github.io/InPostTools/contact/">contact me</a> if this is incorrect.<br><br>
  
 <span style="font-size: 10px">Error Code: EE-${obfuscated}-PT</span>
  
  </div>
</article>`;

			outputDiv.insertAdjacentHTML("afterend", html);


			break;
		case 'unexpectedValidCheck':
		
			var html = `
<article class="message is-danger" id="outputDiv-${randStr}">
  <div class="message-header">
  <p class="bold">UNEXPECTED ERROR</p>
  </div>
  <div id="msg-text2" class="message-body">
  Please <a href="https://https://SamJones04.github.io/InPostTools/contact/">contact me</a> if this is incorrect.<br><br>
  
 <span style="font-size: 10px">Error Code: UE-${obfuscated}-PT</span>
  
  </div>
</article>`;

			outputDiv.insertAdjacentHTML("afterend", html);


			break;
		case 'notValidTrackingCode-PassedCheck':
		

			var html = `
<article class="message is-danger" id="outputDiv-${randStr}">
  <div class="message-header">
  <p class="bold">UNEXPECTED ERROR</p>
  </div>
  <div id="msg-text2" class="message-body">
  Please <a href="https://https://SamJones04.github.io/InPostTools/contact/">contact me</a> if this is incorrect.<br><br>
  
 <span style="font-size: 10px">Error Code: UE-${obfuscated}-PT</span>
  
  </div>
</article>`;

			outputDiv.insertAdjacentHTML("afterend", html);
			break;
		case 'notValidTrackingCode-PassedCheckUnexpected':
	

			var html = `
<article class="message is-danger" id="outputDiv-${randStr}">
  <div class="message-header">
  <p class="bold">UNEXPECTED ERROR</p>
  </div>
  <div id="msg-text2" class="message-body">
  Please <a href="https://https://SamJones04.github.io/InPostTools/contact/">contact me</a> if this is incorrect.<br><br>
  
 <span style="font-size: 10px">Error Code: UE-${obfuscated}-PT</span>
  
  </div>
</article>`;

			outputDiv.insertAdjacentHTML("afterend", html);
			break;
	}


}
