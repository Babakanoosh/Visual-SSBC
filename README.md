## SSBC - Simple Stack Based Computer
The SSBC is a simple turing complete system with only 11 instructions.

## Visual SSBC
This is a simple web-based interpreter and debugger for the machine. Run it in the browser over at [babakanoosh.github.io/Visual-SSBC](https://babakanoosh.github.io/Visual-SSBC/).

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
    - will write this later...

  - V1_beta
    - bug fixes **todo**

  - V1_alpha_2 *new features*
    - Added nav bar: **todo**
      - about.
      - cut-down ARTN.
      - architecture.
      - sample code.
      - current-file indication.

  - V1_alpha *fixing what we have*
    - Interpreter works with new HTML layout. **todo**
    - Made stack and code table scrollable.
    - Simplified HTML structure and removed rendundant stuff.
    - Increased size of stack. (48  ->  256 Bytes)
    - Increased size of code.  (256 -> 1024 Bytes)
    - Stack and code now have full Dec and Hex line numbers.
    - Code is now just vertical, not the horizontal wrap around design.
    - Bytes no-longer change to Dec from, add, sub, popext, pushext.
    - New line indication code: **todo**
    - Yellow current-line indicator no longer stuck on jnn and jnz lines. **todo**
    - Stack and Code area size filled in by javascript DOM code to avoid HTML clutter **todo**

  - Original++ (master) *fixed the most essential things*
    - Updated opcodes to latest SSBC specification.
    - Can't see full stack.....so stack is now scrollable.
    - Resetting and reloading code is now possible without reloading the webpage.
    - Added some UI headers.

  - Original
