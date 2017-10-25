//##############################################################################################
//##############################################################################################
//###################################   GLOBAL VARIABLES  ######################################
//##############################################################################################
//##############################################################################################

var stack_Size = 256;
var code_Size = 1024;

var bg_color   = "#DFDFDF";
var sp_color   = "green";
var pc_color   = "yellow";
var pop_color  = "cyan";
var push_color = "orange";
var jmp_color  = "pink";
var txt_input_color = "white";


var Stack_Table = 's_scrollBody';
var Code_Table = 'c_scrollBody';

var code_column = 2;
var comment_column = 3;
var stack_column = 2;


var running = true;

var reader = new FileReader();
var selectedFile = "";

//array: command name, # of bytes after command
var cmds = [
   ["no-op"    ,0],
   ["halt"     ,0],
   ["pushimm"  ,1],
   ["push ext" ,2],code_Size
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

//##############################################################################################
//##############################################################################################
//##############################################################################################
//##############################################################################################
//##############################################################################################


//##############################################################################################
//                                   INTERPRETER ROUTINES
//##############################################################################################

function execute(cmd) {////////////////////NOT WORKING//////////////////////////////////////////
   var pc = parseInt(document.getElementById('pc').value);
   var imm = parseInt(cellAt(pc+1).innerHTML, 2);
   var addr = imm*256 + parseInt(cellAt(pc+2).innerHTML, 2);
   var top = document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)].cells[0];

   document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)].cells[0].style.backgroundColor = bg_color;

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

   document.getElementById('mystack').rows[parseInt(document.getElementById('sp').value)].cells[0].style.backgroundColor = sp_color;

}



//##############################################################################################
//                                      HTML MODIFICATION
//##############################################################################################

$(document).ready(function() {
   fillStack();
   fillCode();

   //calls reset as a 'final' setup procedure. To reduce html clutter reset is called to populate
   //the various input boxes instead of doing it with a value="00000000" in HTML.
   $(document).ready(function() {reset();}); //
});

function fillStack() {
   console.log("Filling stack table...");
   console.log(sRange());

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
   console.log("Filling code table...");
   console.log(cRange());

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
//                                     INTERFACE FUNCTIONS
//##############################################################################################

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

function step() {////////////////////////////////////////NOT WORKING/////////////////////////////////////////////////////
   var int_pc = parseInt(document.getElementById('pc').value,2);// get curent pc

   document.getElementById('ir').value = cellAt(int_pc).innerHTML;//ir equals op code in the code table cell pointed to by pc

   var int_cmd = parseInt(document.getElementById('ir').value, 2);//convert binary opcode to its decimal value

   if(int_cmd < 11){//if valid command output text version of opcode to irc
      document.getElementById('irc').value = cmds[int_cmd][0];
   }

   cellAt(int_pc).style.backgroundColor = bg_color; //reset cell colour



  //execute(int_cmd);


   if(int_cmd < 11){ //increment pc based on opcode
      int_pc += cmds[int_cmd][1];
   }

   int_pc += 1; //

   cellAt(int_pc).style.backgroundColor = "yellow";
   //ScrollToElement(cellAt(pc));
   document.getElementById('pc').value = int_to_10bit(int_pc);

}

function readText(that){

   cTable = document.getElementById(Code_Table);
   sTable = document.getElementById(Stack_Table);

   console.log("grabbing input file");
   console.log(that.files[0]);

   if(that.files && that.files[0]){
      selectedFile = that;
      var reader = new FileReader();

      reader.onload = function (e) {
         var output=e.target.result;

         var row = 0;

         var lines = this.result.split('\n');

         for(var line = 0; line < lines.length; line++){
            console.log(lines[line].substr(0,8) + " ||| " + lines[line].substr(9,49));

            cTable.rows[row].cells[code_column].innerHTML = lines[line].substr(0,8);
            cTable.rows[row].cells[comment_column].innerHTML = lines[line].substr(9,49);
            row++;

         }

         cTable.rows[0].cells[2].style.backgroundColor = "yellow";

      };//end onload()

      reader.readAsText(that.files[0]);

      sTable.rows[0].cells[stack_column].style.backgroundColor = sp_color;

      running = true;

   }//end if html5 filelist support
}

function reload(){
   console.log("Reloading file...");
   reset();
   readText(selectedFile);
}

function reset(){
   console.log("Resetting interpreter...");

   document.getElementById('a').value = "00000000";
   document.getElementById('a').style.backgroundColor = bg_color;

   document.getElementById('in_B').value = "";
   document.getElementById('in_B').style.backgroundColor = txt_input_color;
   document.getElementById('b').value = "00000000";
   document.getElementById('b').style.backgroundColor = bg_color;

   document.getElementById('c').value = "00000000";
   document.getElementById('c').style.backgroundColor = bg_color;

   document.getElementById('in_D').value = "";
   document.getElementById('in_D').style.backgroundColor = txt_input_color;
   document.getElementById('d').value = "00000000";
   document.getElementById('d').style.backgroundColor = bg_color;

   document.getElementById('in_PC').value = "";
   document.getElementById('in_PC').style.backgroundColor = txt_input_color;
   document.getElementById('pc').value = "0000000000";
   document.getElementById('pc').style.backgroundColor = bg_color;

   document.getElementById('ir').value = "00000000";
   document.getElementById('ir').style.backgroundColor = bg_color;

   document.getElementById('irc').value = "";
   document.getElementById('irc').style.backgroundColor = bg_color;

   document.getElementById('in_SP').value = "";
   document.getElementById('in_SP').style.backgroundColor = txt_input_color;
   document.getElementById('sp').value = "00000000";
   document.getElementById('sp').style.backgroundColor = bg_color;

   document.getElementById('in_PSW').value = "";
   document.getElementById('in_PSW').style.backgroundColor = txt_input_color;
   document.getElementById('psw').value = "00000000";
   document.getElementById('psw').style.backgroundColor = bg_color;


   for(i=0; i<stack_Size; i++){//clear stack
      document.getElementById("s_scrollBody").rows[i].cells[stack_column].innerHTML = "00000000";
      document.getElementById("s_scrollBody").rows[i].cells[stack_column].style.backgroundColor = bg_color;
   }

   for(i=0; i<code_Size; i++){//clear code and comments
      document.getElementById("c_scrollBody").rows[i].cells[code_column].innerHTML = "00000000";//code
      document.getElementById("c_scrollBody").rows[i].cells[code_column].style.backgroundColor = bg_color;

      document.getElementById("c_scrollBody").rows[i].cells[comment_column].innerHTML = "";//comment
      document.getElementById("c_scrollBody").rows[i].cells[comment_column].style.backgroundColor = bg_color;
   }

   console.log("Reset Done!");
   console.log("");
}

function Set_SP(){
   console.log("setting SP...");

   var row = parseInt(document.getElementById('in_SP').value,2) //parse binary to decimal

   if(sValidCell(row)){
      console.log("Cell value good.");
      console.log("Value: " + row + " is within " + sRange());

      var old_sp = parseInt(document.getElementById('sp').value,2);// save old SP

      console.log("Old stack value: " + old_sp);

      document.getElementById("s_scrollBody").rows[old_sp].cells[stack_column].style.backgroundColor = bg_color; //clear old sp cell colour

      console.log("Clear old cell colour.");

      document.getElementById('sp').value = document.getElementById('in_SP').value;//update sp
      document.getElementById("s_scrollBody").rows[row].cells[stack_column].style.backgroundColor = sp_color;//colour new sp cell

   }else{
      console.log("ERROR: Cell specified out of range!");
      console.log("Value: " + row);
      console.log(sRange());

   }
   console.log("");
}

function Set_PSW(){////////////////////NOT WORKING//////////////////////////////////////// ADD VALIDITY CHECK
   console.log("set PSW");
   document.getElementById('psw').value = document.getElementById('in_PSW').value;

}

function Set_B(){
   console.log("set B");
   document.getElementById('b').value = document.getElementById('in_B').value;

}

function Set_D(){
   console.log("set D");
   document.getElementById('d').value = document.getElementById('in_D').value;

}

function Set_PC(){
   console.log("setting PC...");

   var row = parseInt(document.getElementById('in_PC').value,2) //parse binary to decimal

   if(cValidCell(row)){
      console.log("Cell value good.");
      console.log("Value: " + row + " is within " + cRange());

      var old_pc = parseInt(document.getElementById('pc').value,2);// save old PC

      console.log("Old program counter value: " + old_pc);

      document.getElementById("c_scrollBody").rows[old_pc].cells[code_column].style.backgroundColor = bg_color; //clear old PC cell colour

      console.log("Clear old cell colour.");

      document.getElementById('pc').value = document.getElementById('in_PC').value;//update PC
      document.getElementById("c_scrollBody").rows[row].cells[code_column].style.backgroundColor = pc_color;//colour new PC cell

   }else{
      console.log("ERROR: Cell specified out of range!");
      console.log("Value: " + row);
      console.log(cRange());

   }
   console.log("");

}

//##############################################################################################
//                                       HELPER FUNCTIONS
//##############################################################################################

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

function int_to_10bit(theInt){
   var binary = ["0","0","0","0","0","0","0","0","0","0"];

   result = theInt;

   for(i=1; i<=10; i++){
      binary[(10-i)] = result % 2;
      result =  (result - (result % 2))/2;
   }

   var binary_string = "";

   for(i=0; i<=9; i++){
      binary_string += binary[(i)].toString();
   }
   return binary_string;
}

function sRange() {
   return "Stack table size: " + stack_Size + " (0-" + (stack_Size-1) + ")";

}

function cRange() {
   return "Code table size: " + code_Size + " (0-" + (code_Size-1) + ")";
}

function sValidCell(intCell) {
   //does the cell specified fall within the stack range?
   if((intCell>=0) && (intCell<stack_Size)){
      return true;
   }else{
      return false;
   }
}

function cValidCell(intCell) {
   //does the cell specified fall within the code range?
   if((intCell>=0) && (intCell<code_Size)){
      return true;
   }else{
      return false;
   }
}

function cellAt(loc) {
   var myTable;

   if((loc<code_Size) && (loc > -1)) {

      myTable = document.getElementById("c_scrollBody");
      return myTable.rows[loc].cells[code_column];

   }else if(loc == 65535){ //PORT D
      return document.getElementById('d');

   }else if(loc == 65534){ //PORT C
      return document.getElementById('c');

   }else if(loc == 65533){ //PORT B
      return document.getElementById('b');

   }else if(loc == 65532){ // PORT A
      return document.getElementById('a');

   }else if(loc == 65531){ //PSW
      return document.getElementById('psw');

   }else if(loc == 65530){ //STACK POINTER
      return document.getElementById('sp');

   }else{
      console.log("Interpreter range exceeded! Program attempted to read/write at location " + loc + " of a min of 0 and a max of " + (code_Size-1));
      return false;

   }
}

function ScrollToElement(theElement){////////////////////////////////////////NOT WORKING/////////////////////////////////////////////////////
   var selectedPosY = 0;

   while(theElement != null){
      selectedPosY += theElement.offsetTop;
      theElement = theElement.offsetParent;
   }

   window.scrollTo(0,selectedPosY);

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