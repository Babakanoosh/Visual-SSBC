//##############################################################################################
//##############################################################################################
//###################################   GLOBAL VARIABLES  ######################################
//##############################################################################################
//##############################################################################################

var stack_Size = 512;
var code_Size  = 1024;

var bg_color   = "#F5F5F5";
var sp_color   = "green";
var pc_color   = "yellow";
var pop_color  = "cyan";
var push_color = "orange";
var jmp_color  = "pink";
var txt_input_color = "white";
var computed_colour = "#D477FF";

var z_flag = "10000000";
var n_flag = "01000000";

var Stack_Table = 's_scrollBody';
var Code_Table = 'c_scrollBody';

var code_column = 2;
var comment_column = 3;
var stack_column = 2;


var running = true;

var reader = new FileReader();
var selectedFile = "";

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

   NOOP    : {op_num:  0, name: "No Operation",     code: "noop"   , operands: 0},
   HALT    : {op_num:  1, name: "Halt",             code: "halt"   , operands: 0},
   PUSHIMM : {op_num:  2, name: "Push Immediate",   code: "pushimm", operands: 1},
   PUSHEXT : {op_num:  3, name: "Push Extended",    code: "pushext", operands: 2},
   POPINH  : {op_num:  4, name: "Pop Inherent",     code: "popinh" , operands: 0},
   POPEXT  : {op_num:  5, name: "Pop Extended",     code: "popext" , operands: 2},
   JNZ     : {op_num:  6, name: "Jump Not Zero",    code: "jnz"    , operands: 2},
   JNN     : {op_num:  7, name: "Jump Not Negative",code: "jnn"    , operands: 2},
   ADD     : {op_num:  8, name: "Addition",         code: "add"    , operands: 0},
   SUB     : {op_num:  9, name: "Subtraction",      code: "sub"    , operands: 0},
   NOR     : {op_num: 10, name: "Not Or",           code: "nor"    , operands: 0}
};

//##############################################################################################
//##############################################################################################
//##############################################################################################
//##############################################################################################
//##############################################################################################


//##############################################################################################
//                                   INTERPRETER ROUTINES
//##############################################################################################

function execute(cmd) {

   var cTable = document.getElementById(Code_Table);
   var sTable = document.getElementById(Stack_Table);

   

   var pc = parseInt(document.getElementById('pc').innerHTML, 2);
   
   if(!cellAt(pc) || !cellAt(pc+1) || !cellAt(pc+2)){
      alert("Program has reached the end of interpreter usable code space!");
      console.log("ERROR: Program has reached the end of interpreter usable code space!");
      console.log("");
      return 0;
   };
   
   var operand_h = cellAt(pc+1).innerHTML;
   var operand_l = cellAt(pc+2).innerHTML;

   var top = sTable.rows[parseInt(document.getElementById('sp').innerHTML, 2)].cells[stack_column];

   sTable.rows[parseInt(document.getElementById('sp').innerHTML,2)].cells[stack_column].style.backgroundColor = bg_color;
   cTable.rows[parseInt(document.getElementById('pc').innerHTML,2)].cells[code_column].style.backgroundColor = bg_color;

   if(cmd <0 || cmd > 10){
      console.log("INVALID OPCODE");
      running = false;
      alert("Fault Line " + pc);
      return 0;

   }
   else if(cmd == OPCODE.NOOP.op_num){
      console.log("NOOP");
      return op(cmd).operands + 1;

   }
   else if(cmd == OPCODE.HALT.op_num){
      console.log("HALT");
      running = false;
      alert("Halt Line " + pc);
      return 0;

   }
   else if(cmd == OPCODE.PUSHIMM.op_num){
      console.log("PUSHIMM");
      
      if(sValidCell(parseInt(document.getElementById('sp').innerHTML, 2) + 1)){
         console.log("       pushing: " + operand_h);
         top.innerHTML = operand_h;
         document.getElementById('sp').innerHTML = int_to_8bit(parseInt(document.getElementById('sp').innerHTML, 2) + 1);
         return op(cmd).operands + 1;
      }else{
         console.log("ERROR: Stack full!");
         console.log("");
         return 0;
      }

   }
   else if(cmd == OPCODE.PUSHEXT.op_num){
      console.log("PUSHEXT");
      
      var addr_16bit = operand_h + operand_l;
      var int_addr = parseInt(addr_16bit, 2);
      
      if(sValidCell(parseInt(document.getElementById('sp').innerHTML, 2) + 1)){
         if(cValidCell(int_addr)){
            console.log("      addr bin: " + addr_16bit);            
            console.log("      addr dec: " + int_addr);
            console.log("       pushing: " + cellAt(int_addr).innerHTML);

            document.getElementById('sp').innerHTML = int_to_8bit(parseInt(document.getElementById('sp').innerHTML, 2) + 1);
            top.innerHTML = cellAt(int_addr).innerHTML;
            cellAt(int_addr).style.backgroundColor = push_color;
            
            return op(cmd).operands + 1;
         }else{
            console.log("ERROR: Address specified out of interpreter range!");
            console.log("Value: " + row);
            console.log(cRange());
            return 0;
         }

      }else{
         console.log("ERROR: Stack full!");
         console.log("");
         return 0;
      }

   }
   else if(cmd == OPCODE.POPINH.op_num){
      console.log("POPINH");

      var int_sp = parseInt(document.getElementById('sp').innerHTML, 2);

      if(sValidCell(int_sp-1)){//is (stack pointer -1) addressable?
         document.getElementById('sp').innerHTML = int_to_8bit(parseInt(document.getElementById('sp').innerHTML, 2) - 1);

         return op(cmd).operands + 1;

      }else{// if not then error
         running = false;

         alert("Pop of empty stack!");
         console.log("ERROR: Pop of empty stack!");
         console.log("");

         return 0;
      }

   }
   else if(cmd == OPCODE.POPEXT.op_num){
      console.log("POPEXT");
      
      var addr_16bit = operand_h + operand_l;
      var int_addr = parseInt(addr_16bit, 2);
      
      if(sValidCell(parseInt(document.getElementById('sp').innerHTML, 2) - 1)){
         if(cValidCell(int_addr)){
            console.log("      addr bin: " + addr_16bit);            
            console.log("      addr dec: " + int_addr);
            console.log("        poping: " + cellAt(int_addr).innerHTML);
            document.getElementById('sp').innerHTML = int_to_8bit(parseInt(document.getElementById('sp').innerHTML, 2) - 1);
            top.innerHTML = cellAt(int_addr).innerHTML;

            cellAt(int_addr).innerHTML = sTable.rows[parseInt(document.getElementById('sp').innerHTML,2)].cells[stack_column].innerHTML;
            cellAt(int_addr).style.backgroundColor = pop_color;
            
            return op(cmd).operands + 1;
         }else{
            console.log("ERROR: Address specified out of interpreter range!");
            console.log("Value: " + row);
            console.log(cRange());
            return 0;
         }

      }else{
         console.log("ERROR: Pop of empty stack!");
         console.log("");
         return 0;
      }

   }
   else if(cmd == OPCODE.ADD.op_num){
      console.log("ADD");

      var sTable = document.getElementById(Stack_Table);
      var int_sp = parseInt(document.getElementById('sp').innerHTML, 2);

      if(sValidCell((int_sp-2))){//is (stack pointer -2) addressable?
         //get a and b

         var byte_a = sTable.rows[int_sp-1].cells[stack_column].innerHTML;
         var byte_b = sTable.rows[int_sp-2].cells[stack_column].innerHTML;

         console.log("        byte a: " + byte_a);
         console.log("        byte b: " + byte_b);

         //add a and b
         var byte_result = add_8bit(byte_a, byte_b);
         console.log("        result: " + byte_result);

         //set PSW
         byte_setPSW(byte_result)

         //put result on stack
         sTable.rows[int_sp-2].cells[stack_column].innerHTML = byte_result;
         sTable.rows[int_sp-2].cells[stack_column].style.backgroundColor = computed_colour;

         //decrement stack pointer
         document.getElementById('sp').innerHTML = int_to_8bit((int_sp-1));

         return op(cmd).operands + 1;
      }else{// if not then error

         alert("Addition of empty/near-empty stack!");
         console.log("ERROR: Addition of empty/near-empty stack!");
         console.log("");

         return 0;
      }


   }
   else if(cmd == OPCODE.SUB.op_num){
      console.log("SUB");

      var sTable = document.getElementById(Stack_Table);
      var int_sp = parseInt(document.getElementById('sp').innerHTML, 2);

      if(sValidCell((int_sp-2))){//is (stack pointer -2) addressable?
         //get a and b

         var byte_a = sTable.rows[int_sp-1].cells[stack_column].innerHTML;
         var byte_b = sTable.rows[int_sp-2].cells[stack_column].innerHTML;

         console.log("        byte a: " + byte_a);
         console.log("        byte b: " + byte_b);

         //2s compliment byte b
         byte_b = not_8bit(byte_b);//flip bits
         byte_b = add_8bit("00000001", byte_b);//add 1

         //add a and b
         var byte_result = add_8bit(byte_a, byte_b);
         console.log("        result: " + byte_result);

         //set PSW
         byte_setPSW(byte_result)

         //put result on stack
         sTable.rows[int_sp-2].cells[stack_column].innerHTML = byte_result;
         sTable.rows[int_sp-2].cells[stack_column].style.backgroundColor = computed_colour;

         //decrement stack pointer
         document.getElementById('sp').innerHTML = int_to_8bit((int_sp-1));

         return op(cmd).operands + 1;
      }else{// if not then error

         alert("Subtraction of empty/near-empty stack!");
         console.log("ERROR: Subtraction of empty/near-empty stack!");
         console.log("");

         return 0;
      }

   }
   else if(cmd == OPCODE.NOR.op_num){
      console.log("NOR");

      var sTable = document.getElementById(Stack_Table);
      var int_sp = parseInt(document.getElementById('sp').innerHTML, 2);

      if(sValidCell((int_sp-2))){//is (stack pointer -2) addressable?
         //get a and b

         var byte_a = sTable.rows[int_sp-1].cells[stack_column].innerHTML;
         var byte_b = sTable.rows[int_sp-2].cells[stack_column].innerHTML;

         console.log("        byte a: " + byte_a);
         console.log("        byte b: " + byte_b);


         //nor a and b
         var byte_result = nor_8bit(byte_a, byte_b);
         console.log("        result: " + byte_result);


         //put result on stack
         sTable.rows[int_sp-2].cells[stack_column].innerHTML = byte_result;
         sTable.rows[int_sp-2].cells[stack_column].style.backgroundColor = computed_colour;

         //decrement stack pointer
         document.getElementById('sp').innerHTML = int_to_8bit((int_sp-1));

         return op(cmd).operands + 1;
      }else{// if not then error

         alert("NOR of empty/near-empty stack!");
         console.log("ERROR: NOR of empty/near-empty stack!");
         console.log("");

         return 0;
      }

   }
   else if(cmd == OPCODE.JNN.op_num){
      console.log("JNN");
      
      var addr_16bit = operand_h + operand_l;
      var int_addr = parseInt(addr_16bit, 2);
      console.log("      addr bin: " + addr_16bit);
      console.log("      addr dec: " + int_addr);
      if(document.getElementById('psw').innerHTML != n_flag){
         if(cValidCell(int_addr)){

            cellAt(pc).style.backgroundColor = jmp_color;
            document.getElementById('pc').innerHTML = int_to_10bit(int_addr-1);//-1 offset due to step() fault check coding
            return 1;
         }else{
            console.log("ERROR: Address specified out of interpreter range!");
            console.log("Value: " + row);
            console.log(cRange());
            return 0;
         }
      }else{
         console.log("Flag set, skipping jump.");
         return op(cmd).operands + 1;
      }

   }
   else if(cmd == OPCODE.JNZ.op_num){
      console.log("JNZ");
      
      var addr_16bit = operand_h + operand_l;
      var int_addr = parseInt(addr_16bit, 2);
      console.log("      addr bin: " + addr_16bit);
      console.log("      addr dec: " + int_addr);
      if(document.getElementById('psw').innerHTML != z_flag){
         if(cValidCell(int_addr)){

            cellAt(pc).style.backgroundColor = jmp_color;
            document.getElementById('pc').innerHTML = int_to_10bit(int_addr-1);//-1 offset due to step() fault check coding
            return 1;
         }else{
            console.log("ERROR: Address specified out of interpreter range!");
            console.log("Value: " + row);
            console.log(cRange());
            return 0;
         }
      }else{
         console.log("Flag set, skipping jump.");
         return op(cmd).operands + 1;
      }
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
   var int_pc = parseInt(document.getElementById('pc').innerHTML,2);// get curent pc
   var int_cmd = parseInt(cellAt(int_pc).innerHTML, 2);//convert binary opcode to its decimal value
   var sTable = document.getElementById(Stack_Table);

   document.getElementById('ir').innerHTML = cellAt(int_pc).innerHTML;//ir equals op code in the code table cell pointed to by pc
   document.getElementById('irc').innerHTML = op(int_cmd).code;

   cellAt(int_pc).style.backgroundColor = bg_color; //reset cell colour

   var pc_increment = execute(int_cmd);

   if(pc_increment == 0){running = false;} //0 means halt or fault due to how execute() is coded

   int_pc = parseInt(document.getElementById('pc').innerHTML,2);// get pc again incase a jump happened
   int_pc += pc_increment;


   cellAt(int_pc).style.backgroundColor = pc_color;

   ScrollCode(parseInt(document.getElementById('pc').innerHTML, 2));
   //ScrollStack(parseInt(document.getElementById('sp').innerHTML, 2));

   document.getElementById('pc').innerHTML = int_to_10bit(int_pc);

   sTable.rows[parseInt(document.getElementById('sp').innerHTML, 2)].cells[stack_column].style.backgroundColor = sp_color;
}

function readText(that){
   
   reset_interpreter()
   
   cTable = document.getElementById(Code_Table);
   sTable = document.getElementById(Stack_Table);

   console.log("Loading input file...");
   //console.log(that.files[0]);

   if(that.files && that.files[0]){
      selectedFile = that;
      var reader = new FileReader();

      reader.onload = function (e) {
         var output=e.target.result;

         var row = 0;

         var lines = this.result.split('\n');
         console.log("Writing file to code table...");
         for(var line = 0; line < lines.length; line++){
            //console.log(lines[line].substr(0,8) + " ||| " + lines[line].substr(9,49));

            cTable.rows[row].cells[code_column].innerHTML = lines[line].substr(0,8);
            cTable.rows[row].cells[comment_column].innerHTML = lines[line].substr(9,55);
            row++;

         }
         console.log("Write done.");
         console.log("");
         cTable.rows[0].cells[code_column].style.backgroundColor = "yellow";

      };//end onload()

      reader.readAsText(that.files[0]);

      sTable.rows[0].cells[stack_column].style.backgroundColor = sp_color;

      running = true;
      console.log("File load done.");
      console.log("");
   }//end if html5 filelist support
}

//##############################################################################################
//                                      HTML MODIFICATION
//##############################################################################################


$(document).ready(function() {
   console.log("Initializing interpreter...");
   fillStack();
   fillCode();

   //setting table height
   $("table.gui").css("height", (window.innerHeight - ($("#file_in").height() + $("#info").height())) + "px");
   
   $(document).ready(function() {
      console.log("Making table scrollable...");

      var s_head_height = $('#mystack').find('thead').outerHeight();
      var s_td_height = $('#stack_td').height();
      var s_padding = 2;

      var s_proper_height = s_td_height - s_head_height - s_padding;

      var c_head_height = $('#dataSection').find('thead').outerHeight();
      var c_td_height = $('#code_td').height();
      var c_padding = 2;

      var c_proper_height = c_td_height - c_head_height - c_padding;

      scrolify($('#mystack'), s_proper_height,"s_scrollBody");
      scrolify($('#dataSection'), c_proper_height,"c_scrollBody");

      console.log("Scroll Done.");
      console.log("");

   });
   
   //calls reset as a 'final' setup procedure. To reduce html clutter reset is called to populate
   //the various input boxes instead of doing it with a value="00000000" in HTML.
   $(document).ready(function() {reset_interpreter();});
   
   $(document).ready(function() {
   console.log("Initializion finished!");
   console.log("");
   console.log("====================================");
   console.log("            VISUAL  SSBC            ");
   console.log("            V1.0 APLHA 1            ");
   console.log("====================================");
   console.log("");
   });
});

function fillStack() {
   console.log("Filling stack table...");
   console.log(sRange());

   var table = document.getElementById("mystack").getElementsByTagName('tbody')[0];

   for(i=(stack_Size-1); i>=0; i--){
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

function reload(){

   if(selectedFile != ""){
      console.log("Reloading file...");
      reset_interpreter();
      readText(selectedFile);
   }else{
      console.log("ERROR: No file selected. Can't reload nothing!");
      console.log("");
      alert("No file selected. Can't reload nothing!");
   }
}

function reset_interpreter(){
   console.log("Resetting interpreter...");

   running = false;

   document.getElementById('a').innerHTML = "00000000";
   document.getElementById('a').style.backgroundColor = bg_color;

   document.getElementById('in_B').value = "";
   document.getElementById('in_B').style.backgroundColor = txt_input_color;
   document.getElementById('b').innerHTML = "00000000";
   document.getElementById('b').style.backgroundColor = bg_color;

   document.getElementById('c').innerHTML = "00000000";
   document.getElementById('c').style.backgroundColor = bg_color;

   document.getElementById('in_D').value = "";
   document.getElementById('in_D').style.backgroundColor = txt_input_color;
   document.getElementById('d').innerHTML = "00000000";
   document.getElementById('d').style.backgroundColor = bg_color;

   document.getElementById('in_PC').value = "";
   document.getElementById('in_PC').style.backgroundColor = txt_input_color;
   document.getElementById('pc').innerHTML = "0000000000";
   document.getElementById('pc').style.backgroundColor = bg_color;

   document.getElementById('ir').innerHTML = "00000000";
   document.getElementById('ir').style.backgroundColor = bg_color;

   document.getElementById('irc').innerHTML = " ";
   document.getElementById('irc').style.backgroundColor = bg_color;

   document.getElementById('in_SP').value = "";
   document.getElementById('in_SP').style.backgroundColor = txt_input_color;
   document.getElementById('sp').innerHTML = "00000000";
   document.getElementById('sp').style.backgroundColor = bg_color;

   document.getElementById('in_PSW').value = "";
   document.getElementById('in_PSW').style.backgroundColor = txt_input_color;
   document.getElementById('psw').innerHTML = "00000000";
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

   ScrollCode(0);
   ScrollStack(0);

   console.log("Reset Done!");
   console.log("");
}

function Set_SP(){
   console.log("setting SP...");

   var row = parseInt(document.getElementById('in_SP').value,2) //parse binary to decimal

   if(sValidCell(row)){
      console.log("Cell value good.");
      console.log("Value: " + row + " is within " + sRange());

      var old_sp = parseInt(document.getElementById('sp').innerHTML,2);// save old SP

      console.log("Old stack value: " + old_sp);

      document.getElementById("s_scrollBody").rows[old_sp].cells[stack_column].style.backgroundColor = bg_color; //clear old sp cell colour

      console.log("Clear old cell colour.");

      document.getElementById('sp').innerHTML = document.getElementById('in_SP').value;//update sp
      document.getElementById("s_scrollBody").rows[row].cells[stack_column].style.backgroundColor = sp_color;//colour new sp cell

   }else{
      console.log("ERROR: Address specified out of interpreter range!");
      console.log("Value: " + row);
      console.log(sRange());

   }
   console.log("");
}

function Set_PSW(){
   console.log("Setting PSW...");
   var input = document.getElementById('in_PSW').value

   if((input == z_flag) || (input == n_flag) || (input == "00000000")){
      console.log("Status word good.");
      document.getElementById('psw').innerHTML = document.getElementById('in_PSW').value;
      console.log("Status word set.");
   }else{
      console.log("ERROR: Invalid Status Word!");
       alert("Invalid Status Word!");
   }
}

function Set_B(){
   console.log("set B");
   document.getElementById('b').innerHTML = document.getElementById('in_B').value;

}

function Set_D(){
   console.log("set D");
   document.getElementById('d').innerHTML = document.getElementById('in_D').value;

}

function Set_PC(){
   console.log("setting PC...");

   var row = parseInt(document.getElementById('in_PC').value,2) //parse binary to decimal

   if(cValidCell(row)){
      console.log("Cell value good.");
      console.log("Value: " + row + " is within " + cRange());

      var old_pc = parseInt(document.getElementById('pc').innerHTML,2);// save old PC

      console.log("Old program counter value: " + old_pc);

      document.getElementById("c_scrollBody").rows[old_pc].cells[code_column].style.backgroundColor = bg_color; //clear old PC cell colour

      console.log("Clear old cell colour.");

      document.getElementById('pc').innerHTML = document.getElementById('in_PC').value;//update PC
      document.getElementById("c_scrollBody").rows[row].cells[code_column].style.backgroundColor = pc_color;//colour new PC cell

   }else{
      console.log("ERROR: Address specified out of interpreter range!");
      console.log("Value: " + row);
      console.log(cRange());

   }
   console.log("");

}

//##############################################################################################
//                                       HELPER FUNCTIONS
//##############################################################################################

function int_setPSW(result){
   if(result == 0){
      cellAt(65531).innerHTML = z_flag;
      return z_flag;
   }if(result > 0){
      cellAt(65531).innerHTML = "00000000";
      return "00000000";
   }if(result < 0){
      cellAt(65531).innerHTML = n_flag;
      return n_flag;
   }
}

function byte_setPSW(result){
   if(result == "00000000"){
      cellAt(65531).innerHTML = z_flag;
      return z_flag;
   }if(result[0] == "0"){
      cellAt(65531).innerHTML = "00000000";
      return "00000000";
   }if(result[0] == "1"){
      cellAt(65531).innerHTML = n_flag;
      return n_flag;
   }
}

function int_to_8bit(theInt){
   var binary = ["0","0","0","0","0","0","0","0"];

   result = theInt;

   for(var i=1; i<=8; i++){
      binary[(8-i)] = result % 2;
      result =  (result - (result % 2))/2;
   }

   var binary_string = "";

   for(var i=0; i<=7; i++){
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

function not_8bit(byte_a){
   var binary_string = "";

   for(var i=0; i<8; i++){
      if(byte_a[i] == "1"){
         binary_string += "0";
      }else{
         binary_string += "1";
      }
   }

   return binary_string;
}

function or_8bit(byte_a, byte_b){
   var binary_string = "";

   for(var i=0; i<8; i++){
      if((byte_a[i] == "1")||(byte_b[i] == "1")){
         binary_string += "1";
      }else{
         binary_string += "0";
      }
   }

   return binary_string;
}

function nor_8bit(byte_a, byte_b){ 

   return not_8bit(or_8bit(byte_a, byte_b));
}

function add_8bit(byteA, byteB){
   var binary = ["0","0","0","0","0","0","0","0","0","0"];
   var carry = "";
   var binary_string = "";

   for(var i=7; i>=0; i--){
      if((byteA[i] == "1") && (byteB[i] == "1")){ //both 1

         if(carry == "1"){
            binary[i] = "1";
            carry = "1";

         }else{
            binary[i] = "0";
            carry = "1";

         }

      }else if((byteA[i] == "1") || (byteB[i] == "1")){//either 1

         if(carry == "1"){
            binary[i] = "0";
            carry = "1";

         }else{
            binary[i] = "1";
            carry = "0";

         }

      }else if((byteA[i] == "0") && (byteB[i] == "0")){//both 0

        if(carry == "1"){
            binary[i] = "1";
            carry = "0";

         }else{
            binary[i] = "0";
            carry = "0";

         }
      }
   }

   for(var i=0; i<=7; i++){
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
   if(((intCell>=0) && (intCell<code_Size)) || ((intCell >= 65531) && (intCell <= 65535))){
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

   }else{
      console.log("Interpreter range exceeded! Program attempted to read/write at location " + loc + " of a min of 0 and a max of " + (code_Size-1));
      return false;

   }
}

function ScrollCode(row){
   var cTable = document.getElementById(Code_Table);

   if((row-4) >= 0){
      cTable.rows[row-4].cells[code_column].scrollIntoView()
      window.scrollTo(0,0);
   }else{
      cTable.rows[0].cells[code_column].scrollIntoView()
      window.scrollTo(0,0);
   }
}

function ScrollStack(row){
   var sTable = document.getElementById(Stack_Table);

   if((row-4) >= 0){
      sTable.rows[row-4].cells[stack_column].scrollIntoView()
      window.scrollTo(0,0);
   }else{
      sTable.rows[0].cells[stack_column].scrollIntoView()
      window.scrollTo(0,0);
   }
}

function op(OpcodeNum){
   if(OpcodeNum <0 || OpcodeNum > 10){
      return false;

   }if(OpcodeNum == OPCODE.NOOP.op_num){
      //console.log("NOOP")
      return OPCODE.NOOP;

   }if(OpcodeNum == OPCODE.HALT.op_num){
      //console.log("HALT")
      return OPCODE.HALT;

   }if(OpcodeNum == OPCODE.PUSHIMM.op_num){
      //console.log("PUSHIMM")
      return OPCODE.PUSHIMM;

   }if(OpcodeNum == OPCODE.PUSHEXT.op_num){
      //console.log("PUSHEXT")
      return OPCODE.PUSHEXT;

   }if(OpcodeNum == OPCODE.POPINH.op_num){
      //console.log("POPINH")
      return OPCODE.POPINH;

   }if(OpcodeNum == OPCODE.POPEXT.op_num){
      //console.log("POPEXT")
      return OPCODE.POPEXT;

   }if(OpcodeNum == OPCODE.ADD.op_num){
      //console.log("ADD")
      return OPCODE.ADD;

   }if(OpcodeNum == OPCODE.SUB.op_num){
      //console.log("SUB")
      return OPCODE.SUB;

   }if(OpcodeNum == OPCODE.NOR.op_num){
      //console.log("NOR")
      return OPCODE.NOR;

   }if(OpcodeNum == OPCODE.JNN.op_num){
      //console.log("JNN")
      return OPCODE.JNN;

   }if(OpcodeNum == OPCODE.JNZ.op_num){
      //console.log("JNZ")
      return OPCODE.JNZ;

   }
}

function scrolify(tblAsJQueryObject, height, id){

   var oTbl = tblAsJQueryObject;


   // for very large tables you can remove the four lines below
   // and wrap the table with <div> in the mark-up and assign
   // height and overflow property

   var oTblDiv = $("<div/>");
   oTblDiv.css('height', height);
   oTblDiv.css('overflow-y','scroll');
   oTbl.wrap(oTblDiv);


   // save original width
   oTbl.attr("data-item-original-width", oTbl.width());
   oTbl.find('thead tr td').each(function(){
       $(this).attr("data-item-original-width",$(this).width());
   });
   oTbl.find('tbody tr:eq(0) td').each(function(){
       $(this).attr("data-item-original-width",$(this).width());
   });


   // clone the original table
   var newTbl = oTbl.clone();

   // remove table header from original table
   oTbl.find('thead tr').remove();
   // remove table body from new table
   newTbl.find('tbody tr').remove();

   oTbl.parent().parent().prepend(newTbl);
   newTbl.wrap("<div/>");

   // replace ORIGINAL COLUMN width
   newTbl.width(newTbl.attr('data-item-original-width'));
   newTbl.find('thead tr td').each(function(){
       $(this).width($(this).attr("data-item-original-width"));
   });
   oTbl.width(oTbl.attr('data-item-original-width'));
   oTbl.find('tbody tr:eq(0) td').each(function(){
       $(this).width($(this).attr("data-item-original-width"));
   });

   oTbl.find('tbody').attr('id',id);
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