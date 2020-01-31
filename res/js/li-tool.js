var inspFocus = false;
var text = "<object><id>f8c50810e2e6d8a6d472a5f225abbc4e</id><name></name><pose/><truncated>1</truncated><difficult>0</difficult><bndbox><xmin>509.6153846153843</xmin><ymin>204.80769230769218</ymin><xmax>631.7307692307688</xmax><ymax>358.6538461538459</ymax></bndbox></object>";
var start = function()
{
  activityIndicator.show(); // show spinner
  $('.sidenav').sidenav({edge:'right',draggable: false});
  loadInsp();
  loadImage();
  window.addEventListener('keydown', function (e) {
    if(inspFocus) return;
    var kp = e.ctrlKey || e.keyCode;
    if(kp == 8 || kp == 46){
      canvas.remove(canvas.getActiveObject());
      refreshBoxData();
    }
  });

  $(".menuMarkup").focusin(function(){
     canvas.discardActiveObject();
     canvas.requestRenderAll();
  });
}

var theImage = {};
var theBoxes = {
  list: [],
  update: function(){
  }
}

var intAnnot ;
function loadAnnots()
{
  loadFile(theImage.annots, function(data){
    test_xml(data);   
    return;
   /* var x2js = new X2JS();
    alert(data)
    intAnnot =  x2js.xml_str2json(data);
    alert(intAnnot)*/
  });

}

var inst, canvas;
var rect, isDown, origX, origY;
function loadImage()
{
    var x = window.location.hash.replace("#","").split(",");
    var url = x[0];
    var annots = x[1] || null;
    convertImgToDataURLviaCanvas(url, function(data){
     // document.getElementById("imagePreview").onload = __start;
 //     document.getElementById("imagePreview").src = data;
       var c = document.getElementById("imageC");
       var ctx = c.getContext("2d");
       
       var img = new Image();
            img.onload = function(){
            // c.width = img.width;
            // c.height = img.height;


            theImage.annots = annots;
            theImage.path = url;
            theImage.width = img.width;
            theImage.height = img.height;
            theImage.data = data;
             canvas = new fabric.Canvas('imageC', { selection: true, hasControls:true, width:img.width, height:img.height});
             /*
            theImage.obj = new fabric.Image.fromURL(data, function(oImg) {
              canvas.add(oImg);
              oImg.set('selectable', false);
              oImg.set('hasBorders', false);
              oImg.set('hasControls', false);
              oImg.set('lockMovementX', true);
              });
             */

            canvas.setBackgroundImage(
              data,
             canvas.renderAll.bind(canvas)
            );

            if(annots){ loadAnnots() ;}
  
            canvas.on('selection:created', (e) => {
  if(e.target.type === 'activeSelection') {
    canvas.discardActiveObject();
  } else {
    //do nothing
  }
})

  canvas.on('object:moving', function (e) {
        var obj = e.target;
        var zoom = canvas.getZoom();
         // if object is too big ignore
        if(obj.currentHeight > obj.canvas.height*zoom || obj.currentWidth > obj.canvas.width*zoom){
            return;
        }
        obj.setCoords();
        // top-left  corner
        if(obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0){
            obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
            obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);
        }
        // bot-right corner
        if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height*zoom || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width*zoom){
            obj.top = Math.min(obj.top, obj.canvas.height*zoom-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top);
            obj.left = Math.min(obj.left, obj.canvas.width*zoom-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left);
        }
});

  canvas.on('object:scaling', function (e) {
        var obj = e.target;
        var zoom = canvas.getZoom();
         // if object is too big ignore
        if(obj.currentHeight > obj.canvas.height*zoom || obj.currentWidth > obj.canvas.width*zoom){
            return;
        }
        obj.setCoords();
        // top-left  corner
        if(obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0){
            obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
            obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);
        }
        // bot-right corner
        if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height*zoom || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width*zoom){
            obj.top = Math.min(obj.top, obj.canvas.height*zoom-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top);
            obj.left = Math.min(obj.left, obj.canvas.width*zoom-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left);
        }
});

canvas.on('selection:created', function (e) {
  const activeSelection = e.target
  activeSelection.set({hasRotatingPoint: false})
})

// fired e.g. when you select one object first,
// then add another via shift+click
canvas.on('selection:updated', function (e) {
  const activeSelection = e.target
  if (activeSelection.hasRotatingPoint) {
    activeSelection.set({hasRotatingPoint: false})
  }
})

            canvas.on('mouse:wheel', function(opt) {

              if(!opt.e.shiftKey) return;
                
              var delta = opt.e.deltaY;
              var zoom = canvas.getZoom();
              zoom = zoom + delta/200;
              if (zoom > 5) zoom = 5;
              if (zoom < 0.05) zoom = 0.05;
              canvas.setZoom(zoom);
              canvas.setWidth(theImage.width* zoom);
              canvas.setHeight(theImage.height* zoom);
             // canvas.renderAll();
              opt.e.preventDefault();
              opt.e.stopPropagation();
            });
            canvas.on('mouse:down', function(o){
              if (canvas.getActiveObject())
                  return;
              isDown = true;
              var pointer = canvas.getPointer(o.e);
              origX = pointer.x;
              origY = pointer.y;
              var pointer = canvas.getPointer(o.e);
              
              
              rect = new fabric.Rect({
                  left: origX,
                  top: origY,
                  originX: 'left',
                  originY: 'top',
                  width: pointer.x-origX,
                  height: pointer.y-origY,
                  lockRotation: true,
                  lockScalingX: false,
                  lockScalingY: false,
                  angle: 0,
                  fill: 'rgba(255,0,0,0.4)',
                  transparentCorners: false,
                  hasRotatingPoint: false,
                  id: md5(theImage.path + new Date().getTime())
              });
              canvas.add(rect); 
              //test_xml(text);
          }); 

          canvas.on('mouse:move', function(o){
              if (!isDown) return;
              var pointer = canvas.getPointer(o.e);

              if(origX>pointer.x){
                  rect.set({ left: Math.abs(pointer.x) });
              }
              if(origY>pointer.y){
                  rect.set({ top: Math.abs(pointer.y) });
              }

              rect.set({ width: Math.abs(origX - pointer.x) });
              rect.set({ height: Math.abs(origY - pointer.y) });

              canvas.renderAll();
              refreshBoxData();
          });

          canvas.on('mouse:up', function(o){
              if (isDown) {
                var pointer = canvas.getPointer(o.e);
                if((pointer.x-origX) * (pointer.y-origY) < 200){
                  canvas.remove(rect);
                }
                else{
                  rect.setCoords();
                }
                isDown = false;
              }
            refreshBoxData();
          });
        }
        img.src = data;

      activityIndicator.hide();

    
    });
}

function loadInsp()
{
  loadFile("/res/insp.html", function(data){
    $(".sidenav").html($(".sidenav").html() + data);
    $('.collapsible').collapsible();
    $('select').formSelect();
    $(".specColor").spectrum(
      {clickoutFiresChange: true,
        flat:true,
        showPalette: true,
        cancelText: "",
        chooseText: "",
        localStorageKey: "spec"});
  });
}

function convertImgToDataURLviaCanvas(url, callback){
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
       canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL("png");
        callback(dataURL);
        canvas = null;
    };
    img.src = url;
}

var activityIndicator = {
  show:function(){
    $("body").append('<div style="position: fixed;height: 100vh;width: 100vw;text-align: center;background-color: rgba(255,255,255,.8);z-index: 100000;" class="ac"><svg class="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg" style="margin-top: 45vh;"> <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle> </svg></div>');
  },
  hide: function(){
    $(".ac").remove();
  }
}

function gradCheckChanged(e)
{
  var v = e.target.checked;
  if(v){
    $(".gradOptions").fadeIn();
  }
  else{
    $(".gradOptions").fadeOut();
  }
  $(".gradOptions").val(v);
}


function selectChanged(e)
{
  var v = e.target.value;
  if(v === "custom"){
    $(".customOptions").fadeIn();
  }
  else{
    $(".customOptions").fadeOut();
  }
  $(".theSelect").val(v);
}


function fselectChanged(e)
{
  var v = e.target.value;
  if(v === "none"){
    $(".filtersWrapper").fadeOut();
  }
  else{
    $(".filtersWrapper").fadeIn();
  }
  $(".theFSelect").val(v);
}

function updateValueI (e) {
  var sibling = $(e.target).closest(".row").find("input[type=range]")
  console.log(sibling)
  sibling.val(e.target.value);
}

function updateValueS (e) {
  var sibling = $(e.target).closest(".row").find("input[type=number]")
  sibling.val(e.target.value);
}

function imageDataChange(e)
{
  var v = e.target.value;
  var t = e.target.dataset.target;

}


function getJSONAnnots()
{
  var annotation = {
    filename : encodeURIComponent(theImage.path),
    path : encodeURIComponent(theImage.path),
    object : []
  };
  var objs = canvas.getObjects();
  for(var i = 0; i < objs.length; i++){
    var o = objs[i];
    var objObj = {
      id: o.id,
      name : o.name || "",
      pose : undefined,
      truncated: 1,
      difficult: 0,
      bndbox:{
        xmin: o.left,
        ymin: o.top,
        xmax: o.left + o.width,
        ymax: o.top + o.height
      }
    }
    annotation.object.push(objObj);
  }

  return {annotation:annotation};
}

function getXMLAnnots()
{
  var x2js = new X2JS();
  var jsonObj = getJSONAnnots();
  return  x2js.json2xml_str( jsonObj );
}



function setBoxHTML()
{
  var objs = canvas.getObjects();
  var markup = "";
  if(objs.length == 0){
    document.getElementById("boxesList").innerHTML = "<h4>No boxes yet</h4>";
   return; 
  }
  for(var i = 0; i < objs.length; i++){
    var o = objs[i];
    
    var cn = "box" + i + new Date().getTime() + " " + o.id;
    markup += "<div id='aBox' class='"+ cn +"' data-cn='"+ cn +"' data-id='"+o.id+"'> "+
    "<input id ='test'  class='name col8' onInput='updateName(event)' onblur='boxUnSelect(event)' onfocus='boxSelect(event)'>" +
    "<button onclick='deleteBox(event)'>Delete</button>"+
    "</div>";
    $("." + cn+ " .name").val(o.name || "Untitled")
    $("." + cn+ " .label").val(o.label || "no label")





  }


  document.getElementById("boxesList").innerHTML = markup;
}


function refreshBoxData()
{
  $(".ccpta.base64Clip").val(getXMLAnnots())
  $(".ccpta.cssClip").val(JSON.stringify(getJSONAnnots()));
  setBoxHTML();
  $(".collapsible").collapsible("open", 1);
}

function deleteBox(e)
{
  var boxid = e.target.parentElement.dataset.id;
  var cn = e.target.parentElement.dataset.cn;
  
  canvas.remove(getCanvasObjectById(boxid))
  canvas.renderAll();
  refreshBoxData();
  /*
  $(".ccpta.base64Clip").val(getXMLAnnots())
  $(".ccpta.cssClip").val(JSON.stringify(getJSONAnnots()));
  $("#boxesList ." + cn).remove();
  */
  if (canvas.getObjects().length == 0) refreshBoxData();
}

//document.getElementById("imageWrapper").tabIndex = 1000;

function getCanvasObjectById(id)
{
  var list = canvas.getObjects();
  for(var i = 0; i < list.length; i++){
    if(list[i].id && list[i].id === id){
      return list[i];
    }
  }
  return null;
}
function boxSelect(e)
{
  inspFocus = true;
  var boxid = e.target.parentElement.dataset.id;
  var cn = e.target.parentElement.dataset.cn;
  console.log(boxid);
  //var text1= getElementById("test");
  //var sub= text1.innerHTML;
 
  
  canvas.setActiveObject(getCanvasObjectById(boxid));
  canvas.renderAll();
  
  
 // refreshBoxData();
  
  return;
}
 
function boxUnSelect(e)
{
  inspFocus = false;
}
 
function updateName(e)
{
  var text = e.target.value;
  var boxid = e.target.parentElement.dataset.id;
  canvas.getObjects()[boxid].name = text;
}

var text = "<object><id>f8c50810e2e6d8a6d472a5f225abbc4e</id><name></name><pose/><truncated>1</truncated><difficult>0</difficult><bndbox><xmin>9</xmin><ymin>4</ymin><xmax>100</xmax><ymax>358</ymax></bndbox></object>";

function test_xml(text){
     var parser = new DOMParser();
     var test =  parser.parseFromString(text,"text/xml");
     var nodes = test.getElementsByTagName("object")[0].childNodes;
for(var i =0; i < nodes.length; i++){
     var newAnnot = {
         annot_id : test.getElementsByTagName("object")[0].childNodes[i].nodeValue,
         annot_xmin: parseFloat(test.getElementsByTagName("xmin")[i].childNodes[0].nodeValue),
         annot_xmax: parseFloat(test.getElementsByTagName("xmax")[i].childNodes[0].nodeValue),
         annot_ymin:parseFloat(test.getElementsByTagName("ymin")[i].childNodes[0].nodeValue),
         annot_ymax:parseFloat(test.getElementsByTagName("ymax")[i].childNodes[0].nodeValue)
  
     }
     console.log( typeof newAnnot.annot_xmin);
     console.log( newAnnot);

     
     rect = new fabric.Rect({


      
      left: newAnnot.annot_xmin,
      top: newAnnot.annot_ymin,
      originX: 'left',
      originY: 'top', 
      width: ((newAnnot.annot_xmax)-(newAnnot.annot_xmin)),
      height: ((newAnnot.annot_ymax)-(newAnnot.annot_ymin)),
      lockRotation: true,
      lockScalingX: false,
      lockScalingY: false,
      angle: 0,
      fill: 'rgba(255,0,0,0.4)',
      transparentCorners: false,
      hasRotatingPoint: false,
      id: md5(theImage.path + new Date().getTime())
  });

  canvas.add(rect);
  refreshBoxData()
}
  canvas.requestRenderAll();
 // setTimeout("refreshBoxData()",1000);
 

    
    }
  

   

