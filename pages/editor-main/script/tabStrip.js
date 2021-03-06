class tabStrip {
  constructor() {
    this.container = [];
    this.content = document.createElement("div");
    this.content.style.position = "relative";
    this.content.style.width = "100%";
    this.content.style.height = "28px";
	this.grab=false;//judge if the paper can be grabed
    this.content.addEventListener("click", () => {
      for (let i = 0; i < this.container.length; i++) {
        if (this.container[i]!=this.operTb)this.container[i].paper.content.innerHTML="";
        this.container[i].content.style.backgroundColor = "#252525";
        this.container[i].content.style.color = "#808080";
      }
      this.operTb.active();
    });
    this.event = {'cursormove': null};
    this.tagWidth = 290;
    this.zooming = 1.0;
    document.addEventListener("mouseup", this.alignTag.bind(this));
	this.mvfun=(function(e){
		let dy=e.screenY-this.my;
		let dx=e.screenX-this.mx;
		this.paperDisplayer.scrollTop=this.st-dy;
		this.paperDisplayer.scrollLeft=this.sl-dx;
		this.paperDisplayer.style.cursor="-webkit-grabbing";
	}).bind(this);
  }
  addTag(tag) {
    for (let i = 0; i < this.container.length; i++) {
      this.container[i].paper.content.innerHTML= "";
      this.container[i].content.style.backgroundColor = "#252525";
      this.container[i].content.style.color = "#808080";
    }
    tag.setX(this.tagWidth * this.container.length);
    tag.paper.setDisplayer(this.paperDisplayer);
    tag.manager = this;
	tag.paper.manager=this;
    tag.paper.event = this.event;
    this.operTb = tag;
    this.container.push(tag);
    this.content.appendChild(tag.content);
    this.paperDisplayer.appendChild(tag.paper.content);
    tag.active();
  }
  setPaperDisplayer(pd) {
    this.paperDisplayer = pd;
	this.paperDisplayer.addEventListener("mousedown",(e)=>{
		if(this.grab){
			this.st=this.paperDisplayer.scrollTop;
			this.sl=this.paperDisplayer.scrollLeft;
			this.my=e.screenY;
			this.mx=e.screenX;
			this.paperDisplayer.addEventListener("mousemove",this.mvfun);
		}
	});
	this.paperDisplayer.addEventListener('keydown',(e)=>{
		if(e.keyCode==17){//press Ctrl
			if(!this.grab)this.paperDisplayer.style.cursor="-webkit-grab";
			this.grab=true;
		}
	});
	this.paperDisplayer.addEventListener('keyup',(e)=>{
		if(e.keyCode==17){
			this.grab=false;
			this.paperDisplayer.style.cursor="initial";
			this.paperDisplayer.removeEventListener("mousemove",this.mvfun);
		}
	});
  }
  setTagDisplayer(pd) {
    this.tagDisplayer = pd;
    pd.appendChild(this.content);
  }

  remove(child) {
    if(child==null) {
      child = this.operTb;
    }
  
    var idx = this.container.indexOf(child);
    this.container.splice(idx, 1);
    this.content.removeChild(child.content);
    this.paperDisplayer.removeChild(child.paper.content);
    if(child!=this.operTb&&this.container.length>=1) {
      this.operTb = this.container[this.container.length-1];
      this.container[this.container.length-1].active();
      this.operTb.paper.render();
    }
    this.alignTag();
  }

  alignTag() {
    for (let i = 0; i < this.container.length; i++) {
      if (this.container[i].x + this.tagWidth / 2 > (i + 1) * this.tagWidth || this.container[i].x + this.tagWidth / 2 < i * this.tagWidth) {
        let x = Math.floor((this.container[i].x + this.tagWidth / 2) / this.tagWidth);
        if (x < 0) x = 0;
        if (x >= this.container.length) x = this.container.length - 1;
        if (x > i) {
          this.container.splice(x + 1, 0, this.container[i]);
          this.container.splice(i, 1);
        } else {
          this.container.splice(x, 0, this.container[i]);
          this.container.splice(i + 1, 1);
        }
        break;
      }
    }
    for (let i = 0; i < this.container.length; i++) {
      this.container[i].content.style.transition = "left 200ms linear";
      this.container[i].setX(i * this.tagWidth);
    }
	if(this.grab)this.paperDisplayer.style.cursor="-webkit-grab";
	this.paperDisplayer.removeEventListener("mousemove",this.mvfun);
  }
  setZooming(val) {
    this.operTp.setScale(val);
    this.operTp.zoom(val);
    this.zooming = val;
  }
  setEventListener(event) {
    this.event = event;
    for (let i = 0; i < this.container.length; i++) {
      this.container[i].paper.event = this.event;
    }
  }

  getTabCount() {
    return this.container.length;
  }
}

class tabTag {
  constructor(tabname = "New Tab", paper = null) {
    this.paper = paper;
	this.manager=null;
    if (!paper) {
      this.paper = new TabPaper(tabname);
      this.paper.load([[[4, -1]]]);
    }
    this.x = 0;
    this.content = document.createElement("div");
    this.content.onselectstart = function() {
      return false;
    };
    this.content.innerHTML = tabname;
    this.content.setAttribute("class","page")
    this.content.setAttribute(
      "style",
      `
			border-right:1px solid black;
			border-left:1px solid black;
      padding-top: 3px;
			padding-left:9px;
			line-height:27px;
			height:26px;
			width:280px;
			position:absolute;
		`
    );
    var node = document.createElement("div");
    node.setAttribute("class","xbtn");
    node.setAttribute("style",
    `
			height:12px;
			width:12px;
      line-height: 15px;
			position:absolute;
			right: 10px;
      top: 9px;
		`
    );
    this.content.appendChild(node);

    var that = this;
    node.addEventListener('click', function() {
      that.manager.remove(that);
    });

    this.content.addEventListener("click", () => {
      this.manager.operTb = this;
    });
	
    this.content.addEventListener("mousedown", this.startDrag.bind(this));
    this.moveTag = e => {
      this.setX(this.x + e.screenX - this.mx);
      this.mx = e.screenX;
    };
  }
  active() {
    this.paper.render();
    this.content.style.backgroundColor = "#474747";
    this.content.style.color = "#cccccc";
    this.content.style.borderBottom = "1px solid black";
    this.paper.displayer.scrollTop = this.paper.st;
    this.paper.displayer.scrollLeft = this.paper.sl;
    this.manager.operTb = this;
  }
  load(data) {
    this.paper.load(data);
  }
  setX(x) {
    this.content.style.left = x + "px";
    this.x = x;
  }
  startDrag(e) {
    this.mx = e.screenX;
    this.content.style.zIndex = 999;
    this.content.style.transition = "none";
    document.addEventListener("mousemove", this.moveTag);
    document.addEventListener("mouseup", () => {
      this.content.style.zIndex = 1;
      document.removeEventListener("mousemove", this.moveTag);
    });
  }
}

 function closetab(tab) {
    tabStrip.remove(tab);   //can't close tab
}