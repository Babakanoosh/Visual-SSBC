var running = true;

var reader = new FileReader();
var selectedFile = "";
//array: command name, # of bytes after command 
var cmds = [
   ["no-op"    ,0],
   ["halt"     ,0],
   ["pushimm"  ,1],
   ["push ext" ,2],
   ["popinh"   ,0],
   ["pop ext"  ,2],
   ["jnz"      ,2],
   ["jnn"      ,2],
   ["add"      ,0],
   ["sub"      ,0],
   ["nor"      ,0]
];

function ScrollToElement(theElement){

   var selectedPosX = 0;
   var selectedPosY = 0;

   while(theElement != null){
      //selectedPosX += theElement.offsetLeft;
      selectedPosY += theElement.offsetTop;
      theElement = theElement.offsetParent;
   }

   window.scrollTo(selectedPosX,selectedPosY);

}

function execute(cmd) {
   var pc = parseInt(document.getElementById('pc').value);
   var imm = parseInt(cellAt(pc+1).innerHTML, 2);
   var addr = imm*256 + parseInt(cellAt(pc+2).innerHTML, 2);
   var top = document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)].cells[0];
   
   document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)].cells[0].style.backgroundColor = "white";
   
   if(cmd <0 || cmd > 10){ //push ext
      running = false;
      alert("Fault Line " + pc);
      
   }if(cmd == 0){ //no-op
   

   }if(cmd == 1){ //halt
      running = false;
      alert("Halt Line " + pc);
      
   }if(cmd == 2){ //push imm
      top.innerHTML = imm.toString(2).substr(0,8);
      document.getElementById('sp').value = parseInt(document.getElementById('sp').value) + 1;
      
   }if(cmd == 3){ //push ext
      top.innerHTML = cellAt(addr).innerHTML.substr(0,8);
      document.getElementById('sp').value = parseInt(document.getElementById('sp').value) + 1;
      cellAt(addr).style.backgroundColor = "orange";
      
   }if(cmd == 4){ //pop
      document.getElementById('sp').value = parseInt(document.getElementById('sp').value) - 1;
      
      if(parseInt(document.getElementById('sp').value) < 0){
         running = false;
         alert("Pop of empty stack " + cp);
      }
   }if(cmd == 5){ //pop ext
   
      document.getElementById('sp').value = parseInt(document.getElementById('sp').value) - 1;
      
      if(parseInt(document.getElementById('sp').value) < 0){
         running = false;
         alert("Pop of empty stack " + cp);
      }

      top = document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)].cells[0];
      cellAt(addr).innerHTML = top.innerHTML;
      cellAt(addr).style.backgroundColor = "cyan";
      
   }if(cmd == 8 || cmd == 9 || cmd == 10){ //add, sub, nor
   
      document.getElementById('sp').value = parseInt(document.getElementById('sp').value) - 1;
      if(parseInt(document.getElementById('sp').value) < 1){
         running = false;
         alert("Pop of empty stack " + cp);
      }

      var v1 = parseInt(document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)].cells[0].innerHTML, 2);
      var v2 = parseInt(document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)-1].cells[0].innerHTML, 2);
      var result;
   
      if(cmd == 8){
         result = v1 + v2;
      }if(cmd == 9){
         result = v1 - v2;
      }if(cmd == 10){
         result = ~(v1 | v2);
      }
   
   
      if(result == 0){
         cellAt(65531).innerHTML = "10000000"; //PSW
      }if(result > 0){
         cellAt(65531).innerHTML = "00000000"; //PSW
      }if(result < 0){
         cellAt(65531).innerHTML = "01000000"; //PSW
      }

      document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)-1].cells[0].innerHTML = result;

   }if((cmd == 6  && parseInt(cellAt(65531).innerHTML, 2) != parseInt("10000000", 2))||(cmd == 7 && parseInt(cellAt(65531).innerHTML, 2) != parseInt("01000000", 2))){
      cellAt(pc).style.backgroundColor = "pink";
      document.getElementById('pc').value = addr-3;
      pc = parseInt(document.getElementById('pc').value);
      //cellAt(pc).style.backgroundColor = "violet";
      
   }

   document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)].cells[0].style.backgroundColor = "green";

}

function cellAt(loc) {
   var myTable;
   var col = 1;
   var row = loc;

   if(loc<256) {
      while(row>=64) {
         row -= 64;
         col += 1;
      }

      myTable = document.getElementById('dataSection');
      return myTable.rows[row].cells[col];
      
   }else {
      col = (loc %8)-3
      myTable = document.getElementById('dataPorts');
      return myTable.rows[1].cells[col];
   }
}


function run() {
   running = true;
   runMore();
}

function runMore() {
   if(!running) {
      return;
   }
   setTimeout(runMore, 100);
   step();
}

function stop() {
   running = false;
}

function step() {
   var pc = parseInt(document.getElementById('pc').value);
   var myTable = document.getElementById('dataSection');

   document.getElementById('ir').value = cellAt(pc).innerHTML.substr(0,8);
   
   var cmd = parseInt(document.getElementById('ir').value, 2);

   cellAt(pc).style.backgroundColor = "white";
   pc++;
   
   if(cmd < 11){
      document.getElementById('irc').value = cmds[cmd][0];
   }
   
   execute(cmd);
   
   pc = parseInt(document.getElementById('pc').value);
   
   if(cmd < 11){
      pc += cmds[cmd][1];
   }
   
   pc += 1;
   col = 1;
   
   cellAt(pc).style.backgroundColor = "yellow";
   ScrollToElement(cellAt(pc));
   document.getElementById('pc').value = pc;
   
}

function readText(that){

   console.log("grabbing input file");
   console.log(that.files[0]);
   if(that.files && that.files[0]){
      selectedFile = that;
      var reader = new FileReader();
      
      reader.onload = function (e) {
         var output=e.target.result;

         //process text to show only lines with "@":
         //output=output.split("\n").filter(/./.test, /\@/).join("\n");
         var col = 1;
         var row = 0;
         var myTable = document.getElementById('dataSection');
         var lines = this.result.split('\n');
         
         for(var line = 0; line < lines.length; line++){
            myTable.rows[row].cells[col].innerHTML = lines[line].substr(0,20);
            row++;
            
            if (row == 64){
               row = 0;
               col++;
            }
         }
         
         myTable.rows[0].cells[1].style.backgroundColor = "yellow";
      
      };//end onload()
      
      reader.readAsText(that.files[0]);
      
      document.getElementById('pc').value = "0000";
      document.getElementById('ir').value = "00000000";
      document.getElementById('irc').value = "";
      document.getElementById('sp').value = "0000";
      document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)].cells[0].style.backgroundColor = "green";
      
      running = true;

   }//end if html5 filelist support
} 
		
function int_to_8bit(theInt){
   var binary = ["0","0","0","0","0","0","0","0"];
   
   result = theInt;
   
      for(i=1; i<=8; i++){
      binary[(8-i)] = result % 2;
      result =  (result - (result % 2))/2;
    }
    
    var binary_string = "";
   
   for(i=0; i<=7; i++){
      binary_string += binary[(i)].toString();
    }
   return binary_string;
}

function reset(){
   document.getElementById('pc').innerHTML = "0000";
   document.getElementById('ir').innerHTML = "00000000";
   document.getElementById('irc').innerHTML = "";
   document.getElementById('sp').innerHTML = "0000";
   

   for(j=0; j<=4; j++){
      document.getElementById('dataPorts').rows[1].cells[j].innerHTML = "00000000";
      document.getElementById('dataPorts').rows[1].cells[j].style.backgroundColor = "white"
   }

   
   for(i=0; i<=63; i++){
      document.getElementById('mystack').rows[i].cells[0].innerHTML = "00000000";
      document.getElementById('mystack').rows[i].cells[0].style.backgroundColor = "white"
   }
   
   for(i=0; i<=63; i++){
      for(j=1; j<=4; j++){
         document.getElementById('dataSection').rows[i].cells[j].innerHTML = "00000000";
         document.getElementById('dataSection').rows[i].cells[j].style.backgroundColor = "white"
      }
   }
}
   
function reload(){
   reset();
   readText(selectedFile);
}

