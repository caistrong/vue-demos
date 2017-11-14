var apiURL = "https://api.github.com/repos/caistrong/vue-demos/commits?per_page=3&sha="

new Vue({
    el:'#demo',
    data:{
        branches:['master','dev'],
        currentBranch:'master',
        commits:''
    },
    created:function(){
        this.fetchData()
    },
    watch:{
        currentBranch:'fetchData'
    },
    filters:{
        formatDate:function(v){
            return v.replace(/T|Z/g,' ')
        }
    },
    methods:{
        fetchData:function(){
            var xhr = new XMLHttpRequest()
            xhr.open('GET',apiURL+this.currentBranch)
            xhr.onload = ()=>{
                this.commits = JSON.parse(xhr.responseText)
                console.log(this.commits[0].html_url)
            }
            xhr.send()
        }
    }
})