//##############################################################################################
//###################################   GLOBAL VARIABLES  ######################################
//##############################################################################################

var stack_Size = 256;
var code_Size = 1024;


var running = true;

var reader = new FileReader();
var selectedFile = "";

//##############################################################################################
//##############################################################################################
//##############################################################################################



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

var OPCODE = {
    //This is the enumerated list for all of the SSBC opcodes. It is done this way so if an opcode
    //is changed in the ARTN (as is done yearly) you only have to update this and a not a bunch of if statements
    //in the execute function aswell.

    //opcode_num: This number may change so update it as per the current ARTN.
    //            The number you put in here will automagically be converted to binary when needed
    //            so you need not worry about conversion errors.

    //name      : The full name of the function.

    //code      : Name of the code straight from the ARTN.

    //operands  : How many bytes/lines of code after the opcode are used as input.

   NOOP    : {opcode_num:  0, name: "No Operation",     code: "noop"   , operands: 0},
   HALT    : {opcode_num:  1, name: "Halt",             code: "halt"   , operands: 0},
   PUSHIMM : {opcode_num:  2, name: "Push Immediate",   code: "pushimm", operands: 1},
   PUSHEXT : {opcode_num:  3, name: "Push External",    code: "pushext", operands: 2},
   POPINH  : {opcode_num:  4, name: "Pop Inherent",     code: "popinh" , operands: 0},
   POPEXT  : {opcode_num:  5, name: "Pop External",     code: "popext" , operands: 2},
   JNZ     : {opcode_num:  6, name: "Jump Not Zero",    code: "jnz"    , operands: 2},
   JNN     : {opcode_num:  7, name: "Jump Not Negative",code: "jnn"    , operands: 2},
   ADD     : {opcode_num:  8, name: "Addition",         code: "add"    , operands: 0},
   SUB     : {opcode_num:  9, name: "Subtract",         code: "sub"    , operands: 0},
   NOR     : {opcode_num: 10, name: "Not Or",           code: "nor"    , operands: 0}
};

var COLOUR = {

   JUMP  : {},
   PUSH  : {},
   POP   : {},
   SP    : {},
   PC    : {},
};


function ScrollToElement(theElement){
   var selectedPosY = 0;

   while(theElement != null){
      selectedPosY += theElement.offsetTop;
      theElement = theElement.offsetParent;
   }

   window.scrollTo(0,selectedPosY);

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
         var col = 2;
         var row = 0;
         var myTable = document.getElementById("c_scrollBody");
         var lines = this.result.split('\n');

         for(var line = 0; line < lines.length; line++){
            myTable.rows[row].cells[col].innerHTML = lines[line].substr(0,8);
            myTable.rows[row].cells[col+1].innerHTML = lines[line].substr(9,50);
            row++;

         }

         myTable.rows[0].cells[2].style.backgroundColor = "yellow";

      };//end onload()

      reader.readAsText(that.files[0]);

      var table = document.getElementById("s_scrollBody")
console.log(table);
      document.getElementById('pc').value = "0000";
      document.getElementById('ir').value = "00000000";
      document.getElementById('irc').value = "";
      document.getElementById('sp').value = "0000";
      document.getElementById("s_scrollBody").rows[0].cells[2].style.backgroundColor = "green";

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
   console.log("Resetting interpreter...");
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
   console.log("Reloading file...");
   reset();
   readText(selectedFile);
}

function Set_PSW(){
   console.log("set PSW");
}

function Set_B(){
   console.log("set B");
   //document.getElementById('dataPorts').rows[1].cells[2].innerHTML = document.getElementById('portB').value;
}

function Set_D(){
   console.log("set D");
   //document.getElementById('dataPorts').rows[1].cells[4].innerHTML = document.getElementById('portD').value;
}

function Set_PC(){
   console.log("set PC");

}

function Set_SP(){
   console.log("set SP");
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


$( document ).ready(function() {
   fillStack();
   fillCode();
});

function fillStack() {
   console.log("Stack table size: " + stack_Size);
   console.log("Filling stack table...");

   var table = document.getElementById("mystack").getElementsByTagName('tbody')[0];

   for(i=(Math.pow(2,8)-1); i>=0; i--){
      var row = table.insertRow(0);

      var cellLineDec = row.insertCell(0);
      var cellLineHex = row.insertCell(1);
      var cellLineVal = row.insertCell(2);

      cellLineDec.innerHTML = i;
      cellLineHex.innerHTML = (i.toString(16)).toUpperCase();
      cellLineVal.innerHTML = "00000000";
   }
   console.log("Stack fill done.");
   console.log("");
}

function fillCode() {
   console.log("Code table size: " + code_Size);
   console.log("Filling code table...");

   var table = document.getElementById("dataSection").getElementsByTagName('tbody')[0];

   for(i=(Math.pow(2,10)-1); i>=0; i--){
      var row = table.insertRow(0);

      var cellLineDec = row.insertCell(0);
      var cellLineHex = row.insertCell(1);
      var cellLineVal = row.insertCell(2);
      var cellLineCom = row.insertCell(3);

      cellLineDec.innerHTML = i;
      cellLineHex.innerHTML = (i.toString(16)).toUpperCase();
      cellLineVal.innerHTML = "00000000";
      cellLineCom.innerHTML = "";
   }
   console.log("Code fill done.");
   console.log("");
}

//##############################################################################################
//                                       KEYBOARD CONTROL
//##############################################################################################




//Input validation/handling for Set Pogram Status Word textbox
$(function(){
   $('#in_PSW').keypress(function(e){
      if(e.which == 48 || e.which == 49 || e.which == 8){//if 1, 0, or backspace allow
        return;
      }else if(e.which == 13){ //if ENTER then execute input's associated button's command
         Set_PSW();
      }else{//if invalid input report to console, do nothing
         console.log("ERROR: non-binary input.  ID: in_PSW  Key: " + e.which);
         return false;
      }
    });
});

//Input validation/handling for Set Port B textbox
$(function(){
   $('#in_B').keypress(function(e){
      if(e.which == 48 || e.which == 49 || e.which == 8){//if 1, 0, or backspace allow
        return;
      }else if(e.which == 13){ //if ENTER then execute input's associated button's command
         Set_B();
      }else{//if invalid input report to console, do nothing
         console.log("ERROR: non-binary input.  ID: in_B  Key: " + e.which);
         return false;
      }
    });
});

//Input validation/handling for Set Port D textbox
$(function(){
   $('#in_D').keypress(function(e){
      if(e.which == 48 || e.which == 49 || e.which == 8){//if 1, 0, or backspace allow
        return;
      }else if(e.which == 13){ //if ENTER then execute input's associated button's command
         Set_D();
      }else{//if invalid input report to console, do nothing
         console.log("ERROR: non-binary input.  ID: in_D  Key: " + e.which);
         return false;
      }
    });
});

//Input validation/handling for Set Program Counter textbox
$(function(){
   $('#in_PC').keypress(function(e){
      if(e.which == 48 || e.which == 49 || e.which == 8){//if 1, 0, or backspace allow
        return;
      }else if(e.which == 13){ //if ENTER then execute input's associated button's command
         Set_PC();
      }else{//if invalid input report to console, do nothing
         console.log("ERROR: non-binary input.  ID: in_PC  Key: " + e.which);
         return false;
      }
    });
});

//Input validation/handling for Set Stack Pointer textbox
$(function(){
   $('#in_SP').keypress(function(e){
      if(e.which == 48 || e.which == 49 || e.which == 8){//if 1, 0, or backspace allow
        return;
      }else if(e.which == 13){ //if ENTER then execute input's associated button's command
         Set_SP();
      }else{//if invalid input report to console, do nothing
         console.log("ERROR: non-binary input.  ID: in_SP  Key: " + e.which);
         return false;
      }
    });
});


