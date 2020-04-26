/**
 * axios添加jsonp请求
 * @param url
 * @param data
 * @returns {Promise<any>}
 */
axios.jsonp = (url,data)=>{
    if(!url)
        throw new Error('url is necessary')
    const callback = 'CALLBACK' + Math.random().toString().substr(9,18)
    const JSONP = document.createElement('script')
    JSONP.setAttribute('type','text/javascript')

    const headEle = document.getElementsByTagName('head')[0]

    let ret = '';
    if(data){
        if(typeof data === 'string')
            ret = '&' + data;
        else if(typeof data === 'object') {
            for(let key in data)
                ret += '&' + key + '=' + encodeURIComponent(data[key]);
        }
        ret += '&_time=' + Date.now();
    }
    JSONP.src = `${url}?callback=${callback}${ret}`;
    return new Promise( (resolve,reject) => {
        window[callback] = r => {
            resolve(r)
            headEle.removeChild(JSONP)
            delete window[callback]
        }
        headEle.appendChild(JSONP)
    })
}
/**
 * 对象转FormData
 * @param obj
 * @returns {FormData}
 */
var obj2formData=function (obj) {
    let formData = new FormData();
    for (let key in obj){
        formData.append(key,obj[key]);
    }
    return formData;
}
/**
 * 翻译，调用百度翻译
 * @param appid
 * @param key
 * @param query
 * @param from
 * @param to
 * @returns {Promise<any>}
 */
var translate=function (appid,key,query,from,to) {
    var salt = (new Date).getTime();
    var str1 = appid + query + salt +key;
    var sign = MD5(str1);
    var url="http://api.fanyi.baidu.com/api/trans/vip/translate";
    return axios.jsonp(url,{
        q: query,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
    });
}
/**
 * cookie设置
 * @param cname
 * @param cvalue
 * @param exdays
 */
setCookie=function (cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
/**
 * cookie获取
 * @param cname
 * @returns {string}
 */
getCookie=function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}



var paperDeduplicationBox=new Vue({
    el:'#paperDeduplicationBox',
    data:{
        appid:'20200426000430572',//百度翻译api appid
        key:'UOmNlqFRhvgTg9HQdKVP',//百度翻译api 密钥
        query:'',//去重文本
        from:'zh',//文本类型
        level:'1',//去重等级
        result:'',//去重结果
        to:[]
    },
    mounted:function () {
        //获取配置
        let appid = getCookie('appid');
        if (appid!=null){
            this.appid=appid;
        }
        let key = getCookie('key');
        if (key!=null){
            this.key=key;
        }
        let from = getCookie('from');
        if (from!=null){
            this.from=from;
        }
        let level = getCookie('level');
        if (level!=null){
            this.level=level;
        }
    },
    methods:{
        paperDeduplicationBtnClick:function () {
            let $this = this;
            let level = $this.level;
            let to = [];
            //去重分级
            switch (level) {
                case  '1':
                    to=['en','de','zh'];
                    break;
                case '2':
                    to=['en', 'de', 'jp', 'pt', 'zh'];
                    break;
                case '3':
                    to=['en', 'de', 'jp', 'pt', 'it', 'pl', 'bul', 'est', 'zh'];
                    break;
            }
            $this.to=to;
            $this.paperDeduplication($this.appid,$this.key,$this.query,$this.from,to);
        },
        paperDeduplication:function (appid,key,query,from,to) {
            let $this = this;
            var index=0;
            function deduplication(appid,key,query,from,to,index){
                translate(appid,key,query,from,to[index]).then(function (value) {
                    let dst = value.trans_result[0].dst;
                    if (index==to.length-1){
                        $this.result=dst;
                    }else {
                        deduplication(appid,key,dst,to[index],to,index+1);
                    }
                }).catch(function (reason) {
                    alert('发生错误：'+reason);
                });
            }
            deduplication(appid,key,query,from,to,index);
        },
        settingsSaveBtnClick:function () {
            let $this = this;
            setCookie('appid',$this.appid,36500);
            setCookie('key',$this.key,36500);
            setCookie('from',$this.from,36500);
            setCookie('level',$this.level,36500);
            $('#settingsModal').modal('hide')
        }
    }
});