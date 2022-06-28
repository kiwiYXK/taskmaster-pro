var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);
  auditTask(taskLi);
  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    //console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));//把tasks的值储存到网站里
};

var auditTask = function(taskEl){
  // get date from task element 
  var date = $(taskEl).find("span").text().trim();
 // 转换时间为下午五点结束
 var time = moment(date,"L").set("hour",17);
 // 移除所有的旧样式
 $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
 // 如果日期快靠近了，就提供样式
 if(moment().isAfter(time)){
   $(taskEl).addClass("list-group-item-danger");
 }else if(Math.abs(moment().diff(time,"days"))<= 2){
   $(taskEl).addClass("list-group-item-warning");
 }
 };

$(".card .list-group").sortable({
conncetWith: $(".card .list-group"),
scroll: false,
tolerance: "pointer",
helper: "clone",  // 帮助移动副本，而非原始元素
activate: function(event,ui) {
   $(this).addClass("dropover");
   $(".bootom-trash").addClass("bottom-trash-drag")
},
deactivate: function(event,ui){
$(this).removeClass("dropover");
$(".bottom-trash").removeClass("bottom-trash-drag");
},
over: function(event){
$(event.target).addClass("dropover-active");

},
out: function(event){
$(event.target).removeClass("dropover-active")
},
update: function(){
  var tempArr = [];

  $(this).children().each(function(){
  tempArr.push({
   text : $(this).find("p").text().trim(),
    date : $(this).find("span").text().trim(),
   });
   });
   var arrName = $(this).attr('id').replace("list-", "")
   tasks[arrName] = tempArr;
   saveTasks();
},

});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event,ui){ // ui是变量的一个对象，是第二个函数参数，可用于 draggable,helper, position,offset
    ui.draggable.remove();
    $(".bottom-trash").removeClass("bottom-trash-active");
  //  console.log("drop");
  
  },
  over: function(event,ui){
   $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event,ui){
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});
  $("#modalDueDate").datepicker({
  minDate:1    //用于设置从现在的第二天（明天）开始为有效期。
  });

  // modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

 $(".list-group").on("click","p",function(){
 // console.log(this);  //this 表示实际的元素，将显示p的整个hmtl元素和内容
  var text = $(this)
  .text() //text表示get the inner text，这样命令行就会直接显示元素内容
  .trim();
  //console.log(text);
  //  这是在input里添加文本框，起名为form-control.  里面的值是文字格式
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
 });

  $(".list-group").on("blur","textarea",function(){
    //get taexarea's current value/text
    var text = $(this).val().trim();
    //get parent ul's id attribute
    var status = $(this).closest(".list-group").attr("id").replace("list-", "");

    //get the task's position in the list of other li elements
    var index = $(this).closest(".list-group-item").index();
    tasks[status][index].text = text;
    saveTasks();

  //recreate p element
  var taskP = $("<p>").addClass("m-1").text(text);
//replace textarea with p element
$(this).replaceWith(taskP);
  });

  //due date was clicked
$(".list-group").on("click","span",function(){
  //get current text
  var date = $(this).text().trim();

  //create new input element
  var dateInput = $("<input>").attr("type","text").addClass("form-control").val(date);

  //swap out element  置换元素
  $(this).replaceWith(dateInput);

  //添加日期选择器
  dateInput.datepicker({
    minDate: 1,
    onClose: function(){
      // 当日历关闭的时候 在达特input上强制执行change事件
      $(this).trigger("change");
    }
  });
  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("change","input[type='text']",function(){
  
  // get current text 
  var date = $(this).val();
  //get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace('list-',"");
  var index = $(this)
  .closest(".list-group-item")
  .index();
  //update task in array and re-save to localstorage
  tasks[status][index].date= date;
  saveTasks();

  //recreate span element withoostrap classes
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);
//传递元素任务 检查新日期
auditTask($(taskSpan).closest(".list-group-itme"));
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  console.log(tasks);
  saveTasks();
});

// load tasks for the first time
loadTasks();

setInterval(function() {
  $(".card .list-group-item").each(function(){
    auditTask($(this));
  });
}, (1000*60)*30);

