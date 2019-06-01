## SSBC - Simple Stack Based Computer
The SSBC is a simple turing complete system with only 11 instructions.

## Visual SSBC
This is a simple web-based interpreter and debugger for the machine. Run it in the browser over at [babakanoosh.github.io/Visual-SSBC/index.html](https://babakanoosh.github.io/Visual-SSBC/index.html).

## Origin
Original machine specifications developed by [Dr. Peter Walsh](http://csci.viu.ca/~pwalsh/) at VIU and used for CSCI 261 - Assembly Languages. This web interpreter was originally developed by Dr. Julie Beeston and [hosted on her website](http://csci.viu.ca/~beestonj/csci261/index.html).

## Now
It is being updated by a student at VIU.

The op-codes have been updated to work with the latest SSBC version. The "GUI" has been slightly re-done for ease of use. The code has re-structured, re-formatted, and re-factored for maintainability and updatability.

## Development (Present & Planned)
   - V1_1_alpha_2 *debugger*
      - Simple Debugger....more info later **todo**

   - V1_1_alpha_1 *full specification emulation*
      - Code and Memory-mapped I/O are now on the stack. (Yup, the code and memory can overwrite each other!) **todo**
      - Full size of stack. **todo**

   - **Visual SSBC 1.0**
      - Features:
         - New HTML layout.
         - Stack and code table are scrollable.
         - Stack and code have Dec and Hex line numbering.
         - Console based debugger. Press F12 or CTRL+SHIFT+I to view output
         
      - Improvements:
         - Basic user input checking to prevent stupid mistakes.
         - Increased size of stack. (48  -> 1024 Bytes)
         - Increased size of code.  (256 -> 1024 Bytes)
         
      - Bug Fixes:
         - Bytes no-longer change from binary to decimal during execution.
         - Various bug fixes in the execution routine.
      
    
   - V1_beta
      - bug fixes **todo**

   - V1_alpha_2 *new features*
      - Increased size of stack. (48  ->  1024 Bytes)
      - Added a nav bar
         - SSBC documentation
         - Interpreter settings
         - Interpreter info
      
   - V1_alpha *fixing what we have*
      - New HTML layout!
      - Interpreter actually works with new HTML layout.
      - Stack and code table scrollable.
      - Simplified HTML structure and removed rendundant stuff.
      - Increased size of stack. (48  ->  512 Bytes)
      - Increased size of code.  (256 -> 1024 Bytes)
      - Stack and code now have Dec and Hex line numbering.
      - Code is now just vertical, not the previous confusing horizontal wrap around design.
      - Bytes no-longer change from binary to decimal during execution.
      - Stack and Code area size filled in by javascript DOM code to avoid HTML clutter.
      - Various bug fixes in the execution routine.
      - Basic user input checking to prevent stupid mistakes.

   - Original++ (master) *fixed the most essential things*
      - Updated opcodes to latest SSBC specification.
      - Can't see full stack.....so stack is now scrollable.
      - Resetting and reloading code is now possible without reloading the webpage.
      - Added some UI headers.

  - Original
