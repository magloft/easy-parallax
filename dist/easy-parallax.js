!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define("EasyParallax",e):t.EasyParallax=e()}(this,function(){"use strict";var t=navigator.userAgent.toLowerCase().indexOf("android")>-1,e=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,i=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(t){setTimeout(t,1e3/60)},s=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},a=function(){function t(t,e){for(var i=0;i<e.length;i++){var s=e[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(t,s.key,s)}}return function(e,i,s){return i&&t(e.prototype,i),s&&t(e,s),e}}(),n=function(){function i(a,n,o){s(this,i),this.stage=a,this.instanceID=this.stage.nextInstanceID(),this.element=n,this.element.parallax=this,this.defaults={type:"scroll",speed:.5,onScroll:null,onInit:null,onDestroy:null,onCoverImage:null},this.options=this.extend({},this.defaults,o),this.options.speed=Math.min(2,Math.max(-1,parseFloat(this.options.speed))),this.image={src:null,$container:null,useImgTag:!1,position:t||e?"absolute":"fixed"},this.initImg()&&this.init()}return a(i,[{key:"css",value:function(t,e){return"string"==typeof e?this.stage.window.getComputedStyle(t).getPropertyValue(e):(Object.keys(e).forEach(function(i){t.style[i]=e[i]}),t)}},{key:"extend",value:function(){for(var t=arguments.length,e=Array(t),i=0;i<t;i++)e[i]=arguments[i];var s=e[0]||{};return Object.keys(e).forEach(function(t){e[t]&&Object.keys(e[t]).forEach(function(i){s[i]=e[t][i]})}),s}},{key:"initImg",value:function(){var t=this.element.querySelector("img");return t instanceof Element||(t=null),t&&(this.image.$original=t,this.image.element=t.cloneNode(!0),this.image.useImgTag=!0,this.css(t,{position:"relative",display:"block",maxWidth:"100%",height:"auto",zIndex:-100})),!!this.image.element||(null===this.image.src&&(this.image.src=this.css(this.element,"background-image").replace(/^url\(['"]?/g,"").replace(/['"]?\)$/g,"")),!(!this.image.src||"none"===this.image.src))}},{key:"update",value:function(){this.image.useImgTag?this.image.$original.src!==this.image.element.src&&(this.image.element.src=this.image.$original.src):this.image.element.style.backgroundImage!==this.element.style.backgroundImage&&(this.image.element.style.backgroundImage=this.element.style.backgroundImage),this.stage.update()}},{key:"init",value:function(){var t=this,e={position:"absolute",top:0,left:0,width:"100%",height:"100%",overflow:"hidden",pointerEvents:"none"},i={};if("static"===this.css(this.element,"position")&&this.css(this.element,{position:"relative"}),"auto"===this.css(this.element,"z-index")&&this.css(this.element,{zIndex:0}),this.image.$container=this.stage.document.createElement("div"),this.css(this.image.$container,e),this.css(this.image.$container,{zIndex:-100}),this.image.$container.setAttribute("id","parallax-container-"+this.instanceID),this.element.appendChild(this.image.$container),this.image.useImgTag?(i=this.extend({"object-fit":"cover","object-position":"50% 50%","font-family":"object-fit: cover; object-position: 50% 50%;","max-width":"none"},e,i),this.image.element.onload=function(){t.stage.update()}):(this.image.element=this.stage.document.createElement("div"),i=this.extend({"background-position":"50% 50%","background-size":"cover","background-repeat":"no-repeat","background-image":'url("'+this.image.src+'")'},e,i)),"fixed"===this.image.position)for(var s=0,a=this.element;null!==a&&a!==this.stage.document&&0===s;){var n=this.css(a,"-webkit-transform")||this.css(a,"-moz-transform")||this.css(a,"transform");n&&"none"!==n&&(s=1,this.image.position="absolute"),a=a.parentNode}i.position=this.image.position,this.css(this.image.element,i),this.image.$container.appendChild(this.image.element),this.coverImage(),this.clipContainer(),this.onScroll(!0),this.options.onInit&&this.options.onInit.call(this),"none"!==this.css(this.element,"background-image")&&this.css(this.element,{"background-image":"none"}),this.stage.addToParallaxList(this)}},{key:"destroy",value:function(){this.stage.removeFromParallaxList(this),this.element.style.zIndex=null,this.image.useImgTag?(this.css(this.image.$original,{position:null,display:null,maxWidth:null,height:null,zIndex:null}),this.image.element.removeAttribute("style"),this.image.elementParent&&this.image.elementParent.appendChild(this.image.element)):this.css(this.element,{backgroundImage:this.image.element.style.backgroundImage}),this.$clipStyles&&this.$clipStyles.parentNode.removeChild(this.$clipStyles),this.image.$container&&this.image.$container.parentNode.removeChild(this.image.$container),this.options.onDestroy&&this.options.onDestroy.call(this),delete this.element.parallax}},{key:"clipContainer",value:function(){if("fixed"===this.image.position){var t=this.image.$container.getBoundingClientRect(),e=t.width,i=t.height;if(!this.$clipStyles)this.$clipStyles=this.stage.document.createElement("style"),this.$clipStyles.setAttribute("type","text/css"),this.$clipStyles.setAttribute("id","parallax-clip-"+this.instanceID),(this.stage.document.head||this.stage.document.getElementsByTagName("head")[0]).appendChild(this.$clipStyles);var s="#parallax-container-"+this.instanceID+" {\n           clip: rect(0 "+e+"px "+i+"px 0);\n           clip: rect(0, "+e+"px, "+i+"px, 0);\n        }";this.$clipStyles.styleSheet?this.$clipStyles.styleSheet.cssText=s:this.$clipStyles.innerHTML=s}}},{key:"coverImage",value:function(){var t=this.image.$container.getBoundingClientRect(),e=t.height,i=this.options.speed,s="scroll"===this.options.type,a=0,n=e,o=0;s&&(a=i<0?i*Math.max(e,this.stage.height):i*(e+this.stage.height),i>1?n=Math.abs(a-this.stage.height):i<0?n=a/i+Math.abs(a):n+=Math.abs(this.stage.height-e)*(1-i),a/=2),this.parallaxScrollDistance=a,o=s?(this.stage.height-n)/2:(e-n)/2,this.css(this.image.element,{height:n+"px",marginTop:o+"px",left:"fixed"===this.image.position?t.left+"px":"0",width:t.width+"px"}),this.options.onCoverImage&&this.options.onCoverImage.call(this)}},{key:"isVisible",value:function(){return this.isElementInViewport||!1}},{key:"onScroll",value:function(t){var e=this.element.getBoundingClientRect(),i=e.top,s=e.height,a={};if(this.isElementInViewport=e.bottom>=0&&e.right>=0&&e.top<=this.stage.height&&e.left<=this.stage.width,t||this.isElementInViewport){var n=Math.max(0,i),o=Math.max(0,s+i),h=Math.max(0,-i),l=Math.max(0,i+s-this.stage.height),r=Math.max(0,s-(i+s-this.stage.height)),c=Math.max(0,-i+this.stage.height-s),g=1-2*(this.stage.height-i)/(this.stage.height+s),m=1;if(s<this.stage.height?m=1-(h||l)/s:o<=this.stage.height?m=o/this.stage.height:r<=this.stage.height&&(m=r/this.stage.height),"scroll"===this.options.type){var u=this.parallaxScrollDistance*g;"absolute"===this.image.position&&(u-=i),a.transform="translate3d(0,"+u+"px,0)"}this.css(this.image.element,a),this.options.onScroll&&this.options.onScroll.call(this,{section:e,beforeTop:n,beforeTopEnd:o,afterTop:h,beforeBottom:l,beforeBottomEnd:r,afterBottom:c,visiblePercent:m,fromViewportCenter:g})}}},{key:"onResize",value:function(){this.coverImage(),this.clipContainer()}}]),i}();return function(){function t(e){var i=this;s(this,t),this.window=e,this.document=e.document,this.instanceID=0,this.parallaxList=[],this.width=null,this.height=null,this.scrollTop=null,this.forceResizeParallax=!1,this.oldPageData=!1,this.window.addEventListener("resize",function(){i.calculateLayout()}),this.window.addEventListener("orientationchange",function(){i.calculateLayout()})}return a(t,[{key:"nextInstanceID",value:function(){return this.instanceID+=1,this.instanceID}},{key:"add",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=new n(this,t,e);return this.update(),i}},{key:"update",value:function(){this.calculateLayout(),this.forceResizeParallax=!0}},{key:"addToParallaxList",value:function(t){this.parallaxList.push(t),1===this.parallaxList.length&&this.updateParallax()}},{key:"removeFromParallaxList",value:function(t){var e=this;this.parallaxList.forEach(function(i,s){i.instanceID===t.instanceID&&e.parallaxList.splice(s,1)})}},{key:"destroy",value:function(){for(var t=this.parallaxList.length-1;t>=0;t-=1)this.parallaxList[t].destroy()}},{key:"updateParallax",value:function(){if(this.parallaxList.length){void 0!==this.window.pageYOffset?this.scrollTop=this.window.pageYOffset:this.scrollTop=(this.document.documentElement||this.document.body.parentNode||this.document.body).scrollTop;var t=this.forceResizeParallax||!this.oldPageData||this.oldPageData.width!==this.width||this.oldPageData.height!==this.height,e=t||!this.oldPageData||this.oldPageData.scrollTop!==this.scrollTop;this.forceResizeParallax=!1,(t||e)&&(this.parallaxList.forEach(function(i){t&&i.onResize(),e&&i.onScroll()}),this.oldPageData={width:this.width,height:this.height,scrollTop:this.scrollTop}),i(this.updateParallax.bind(this))}}},{key:"calculateLayout",value:function(){this.width=this.window.innerWidth||this.window.document.documentElement.clientWidth,this.height=this.window.innerHeight||this.window.document.documentElement.clientHeight}}]),t}()});
