function isValidPostcode(p) { 
  console.log('- - - Postcode Checker - - -')
  
    var postcodeRegEx = /[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}/i; 
    return postcodeRegEx.test(p); 
    
}

function randomStrGen(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

async function submitText() {
        console.log('Ran - SubmitText')

        let submitButton = document.querySelector('#submitBtn');
        let submitInput = document.querySelector('#textInput');

        submitInput.disabled = true;
        submitButton.disabled = true;

  console.log(`Submitted Postcode: ${submitInput.value}`);
  
  let ps = submitInput.value.trim()
  let val = isValidPostcode(ps);
  
  if(val === true) {
    
    var tst = await IPSTLockerLookup(ps);
    
   
   var myobj = JSON.parse(tst)
   
   console.log(myobj.items[1])
   
   console.log(`NAME: ${myobj.items[0].name}`)
   console.log(`TYPE: ${myobj.items[0].type}`)
   console.log(`STATUS: ${myobj.items[0].status}`)
   console.log(`ADDRESS: ${myobj.items[0].address.line1}`)
   
   let outputDiv = document.getElementById('outputDiv')
   let pos = 0;
   

   let lockerArr = [];
   
   myobj.items.forEach((i) => {
     pos++;
     console.log(pos)
     
     let randStr = randomStrGen(5)
     console.log(i.type)
     
     switch (i.type[0]) {
  case 'parcel_locker':
    var dropType = `<i class="fa fa-archive" aria-hidden="true"></i>&nbsp;&nbsp;InPost Locker`
    break;
  case 'pok':
    var dropType = `<i class="fa fa-shopping-basket" aria-hidden="true"></i>&nbsp;&nbsp;InPost Shop`
    break;
  case 'pop':
    var dropType = `<i class="fa fa-shopping-basket" aria-hidden="true"></i>&nbsp;&nbsp;InPost Shop`
    break;
  default:
    var dropType = 'ERROR FETCHING TYPE'
}
     
     let distance_miles = i.distance / 1609
  let html = `
<article class="message is-success" id="outputDiv-${randStr}">
  <div class="message-header">
  <p class="bold">${dropType}  -  ${i.name}</p>
  </div>
  <div id="msg-text2" class="message-body">
  ${i.address.line1}<br><br>
  Distance: <span class="bold">${distance_miles.toFixed(2)}</span> Miles
  <br><br>
  <a href="https://www.google.com/maps/place/${i.location.latitude},${i.location.longitude}">Location</a>
  
  </div>
</article>`;   
  
  lockerArr.push({
    "distance": distance_miles.toFixed(2),
    "html": html
  })
  
     
   })
   
  lockerArr.reverse();
  
  lockerArr.forEach((val) => {
 
    outputDiv.insertAdjacentHTML("afterend", val.html);
    
  })
   
   //console.log(arr_test)
   
  } else if(val === false) {
    
  failText(val);
    
  } else {
    console.log(`UNEXPECTED ERROR - Value: ${val}, Submitted Postcode: ${ps}`)
  }
} 

async function IPSTLockerLookup(pc) {
  console.log(pc)
  const query = new URLSearchParams({
  status: 'Operating',
  relative_post_code: `${pc}`,
  max_distance: '5000',
  per_page: '5'
}).toString();

const resp = await fetch(
  `https://api-uk-points.easypack24.net/v1/points?${query}`,
  {method: 'GET'}
);

return await resp.text();

}

function failText(res) {

        console.log('FAIL')

        let scannerBtn = document.querySelector('#open-modal');
        let failElem2 = document.querySelector('#failMsg2')

        scannerBtn.remove();

        failElem2.classList.remove('invis');

}

/*
function outpuMsg(res) {

        console.log('OUTPUT')
        let outputMSG2 = document.getElementById('outputMsg')
        
        outputMSG2.classList.remove('invis');

const elemnt = document.getElementById("msg-text2");
  let html = `<p>${res}</p>`;
  elemnt.insertAdjacentHTML("afterend", html);
 
  
}
*/

class BulmaModal {
        constructor(selector) {
                this.elem = document.querySelector(selector)
                this.close_data()
        }

        show() {
                this.elem.classList.toggle('is-active')
                this.on_show()
        }

        close() {
                this.elem.classList.toggle('is-active')
                this.on_close()
        }

        close_data() {
                var modalClose = this.elem.querySelectorAll("[data-bulma-modal='close'], .modal-background")
                var that = this
                modalClose.forEach(function(e) {
                        e.addEventListener("click", function() {

                                that.elem.classList.toggle('is-active')

                                var event = new Event('modal:close')

                                that.elem.dispatchEvent(event);
                        })
                })
        }

        on_show() {
                var event = new Event('modal:show')

                this.elem.dispatchEvent(event);
        }

        on_close() {
                var event = new Event('modal:close')

                this.elem.dispatchEvent(event);
        }

        addEventListener(event, callback) {
                this.elem.addEventListener(event, callback)
        }
}

function reloadPage() {
  window.location.reload(true)
}

var btn = document.querySelector("#open-modal")
var mdl = new BulmaModal("#myModal")

console.log(btn)

btn.addEventListener("click", function() {
        mdl.show()
})

mdl.addEventListener('modal:show', function() {
        console.log("opened")
})

mdl.addEventListener("modal:close", function() {
        console.log("closed")
})
