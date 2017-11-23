// Full spec-compliant TodoMVC with localStorage persistence
// and hash-based routing in ~120 effective lines of JavaScript.

// localStorage persistence
var STORAGE_KEY = 'todos-vuejs-2.0'

//建立一个与todo存储有关的对象todoSrorage
//fetch获取数据，save保存数据
var todoStorage = {
  fetch: function () {
    //第一次使用localStorage.getItem的时候返回应该是undefined
    //因此todo被初始化为空数组
    var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    todos.forEach(function (todo, index) {
      todo.id = index
    })
    todoStorage.uid = todos.length
    return todos
  },
  save: function (todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }
}

// visibility filters
//一些过滤器utils
var filters = {
  all: function (todos) {
    return todos
  },
  active: function (todos) {
    return todos.filter(function (todo) {
      return !todo.completed
    })
  },
  completed: function (todos) {
    return todos.filter(function (todo) {
      return todo.completed
    })
  }
}

// app Vue instance
var app = new Vue({
  // app initial state
  data: {
    //todos data 从刚刚创建的todoStorage存储中去获取
    todos: todoStorage.fetch(),
    newTodo: '',
    editedTodo: null,
    visibility: 'all'
  },

  // watch todos change for localStorage persistence
  //当需要在数据变化时执行异步或开销较大的操作时，watch是最有用的
  watch: {
    todos: {
      handler: function (todos) {
        todoStorage.save(todos)
      },
      deep: true
      //当todos的子属性例如todos[1].completed的值改变了
      //(比如checkbox类型的input绑定v-model="todo.completed")
      //hander这个函数也会触发，如果deep为false则不会
    }
  },

  // computed properties
  // http://vuejs.org/guide/computed.html
  computed: {
    filteredTodos: function () {
      //显示在main页面的数据
      return filters[this.visibility](this.todos)
    },
    remaining: function () {
      //返回还没完成的todo数
      return filters.active(this.todos).length
    },
    allDone: {
      //allDone 单个多选框的时候是逻辑值 true or false
      //当来get这个值的时候 根据当时是否所有todo都alldone
      //来返回true和false
      get: function () {
        return this.remaining === 0
      },
      //当 allDone = true 时 
      //这个setter将todo的所有completed属性都设置为true or false
      set: function (value) {
        this.todos.forEach(function (todo) {
          todo.completed = value
        })
      }
    }
  },

  filters: {
    pluralize: function (n) {
      return n === 1 ? 'item' : 'items'
    }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    addTodo: function () {
      //以下这一行改成下面的也行，但是不如原来的做法
      //原来的做法是如果newTodo是空字符串就不进行trim操作了，效率更高 
      //var value = this.newTodo.trim()
      var value = this.newTodo && this.newTodo.trim()
      if (!value) {
        return
      }
      //这里push进数组的单项为todo
      this.todos.push({
        id: todoStorage.uid++,
        title: value,
        completed: false
      })
      this.newTodo = ''
    },

    //remove用数组splice删除从当前todo开始的1项
    removeTodo: function (todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    },
    
    editTodo: function (todo) {
      this.beforeEditCache = todo.title
      //将正在编辑的todo设为当前todo
      this.editedTodo = todo
    },

    doneEdit: function (todo) {
      if (!this.editedTodo) {
        return
      }
      this.editedTodo = null
      todo.title = todo.title.trim()
      if (!todo.title) {
        this.removeTodo(todo)
      }
    },

    cancelEdit: function (todo) {
      this.editedTodo = null
      todo.title = this.beforeEditCache
    },

    removeCompleted: function () {
      this.todos = filters.active(this.todos)
    }
  },

  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
  directives: {
    // 根据绑定的todo == editedTodo的值的true or false来确认焦点
    'todo-focus': function (el, binding) {
      if (binding.value) {
        el.focus()
      }
    }
  }
})

// handle routing
function onHashChange () {
  //Window.location.hash返回URL中的hash（＃后跟零或多个字符），如果URL中不包含散列，则返回空字符串
  //匹配含有 #/ 或者 # 的字符串并将它替换为 空 ''
  //总之就是为了把URL中的 'all' 'active' 'completed'提取出来 
  var visibility = window.location.hash.replace(/#\/?/, '')
  if (filters[visibility]) {
    app.visibility = visibility
  } else {
    window.location.hash = ''
    app.visibility = 'all'
  }
}

window.addEventListener('hashchange', onHashChange)
onHashChange()

// mount
app.$mount('.todoapp')