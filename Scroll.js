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

$(document).ready(function(){
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
