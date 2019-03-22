var editors = [];
class Container {
	constructor(parent) {
		this._class = this.constructor.name;
		this.id = 'editor' + String(new Date().getTime()) + Math.floor(Math.random() * 1000000);
		if (typeof(md5) !== "undefined") {
			this.id = md5(this.id);
		}
		this._container = null;
		this._parent = parent;
		this._classArray = [];
		this.imgCopy = null;
		this.imgDelete = null;
		this.toolContainer = null;
		this.innerHTML = null;
		if (this.editor) {
			this.editor.referenceWidget(this);
		}
		return this;
	}
	loadFromJson(json) {
		var classArray = [ Container, Dropable, Draggable, DropZoneContainer, DropZoneJunction, ToolBox,  Template, Editor];
		this.editor.template.authorizedClass.forEach(function (classObj) {
			classArray.push(classObj);
		})
		var self = this;
		var unserializeObject = function(obj, parent) {
			var objUnserialized = null;
			if (Array.isArray(obj)) {
				objUnserialized = [];
				obj.forEach(function (elt) {
					objUnserialized.push(unserializeObject(elt, parent));
				});
			} else if  (typeof obj == 'object' && obj != null && obj._class) {
				if (obj._class == 'SOAPRequestStep') obj._class = 'RESTRequestStep';
				var objClass = classArray.reduce(function(accumulator, currentValue) { if (currentValue.name == obj._class) return currentValue; else return accumulator; }, null);
				if (objClass) {
					objUnserialized = new objClass(parent);
					objUnserialized.loadFromJson(obj);						
				} else {
					objUnserialized = obj;
				}
			} else {
				objUnserialized = obj;
			}
			return objUnserialized;
		};
		Object.keys(json).forEach(function(property) {
			var descriptor = Object.getOwnPropertyDescriptor( json , property );
			if (descriptor.enumerable === true) {
				self[property] = unserializeObject(json[property], self);
			}
		});
	}
	get class() {
		return this._classArray;
	}
	set class(classArray) {
		if (classArray) {
			this._classArray = (Array.isArray(classArray) ? classArray : [classArray]);
		} else {
			this._classArray = [];
		}
	}
	fire(eventName, data) {
	}
	createElement(type, text, options) {
		var span = document.createElement(type);
		if (text) span.appendChild(document.createTextNode(text));
		if (options && options.className) span.classList.add(options.className);
		return span;
	}
	createInput(input) {
		var inputElt = document.createElement('input');
		if (input.id) inputElt.id = input.id;
		if (input.name) inputElt.name = input.name;
		if (input.type) inputElt.type = input.type;
		if (input.value) inputElt.value = input.value;
		if (input.innerHTML) inputElt.innerHTML = input.innerHTML;
		if (input.onclick) inputElt.onclick = input.onclick;
		if (input.onchange) inputElt.onchange = input.onchange;
		if (input.onkeyup) inputElt.onkeyup = input.onkeyup;
		if (input.className) {
			if (Array.isArray(input.className)) {
				input.className.forEach(function (className) {
					inputElt.classList.add(className);
				});
			} else {
				inputElt.classList.add(input.className);
			}
		}
		return inputElt;
	}
	clone() {
		var clone = Object.cloneObject(this, function(clonedObject, objectToClone, property, parentClonedObject) {
			if (objectToClone instanceof Container) {
				if (property == 'id') {
					clonedObject.id = 'editor' + String(new Date().getTime()) + Math.floor(Math.random() * 1000000);
					if (typeof(md5) !== "undefined") {
						clonedObject.id = md5(clonedObject.id);
					}
					return false;
				} else if (property == '_parent') {
					clonedObject._parent = parentClonedObject;
					return false;
				} else if (objectToClone[property] instanceof HTMLElement) {
					return false;
				}
			}
			return true;
		});
		clone.id = 'editor' + String(new Date().getTime()) + Math.floor(Math.random() * 1000000);
		if (typeof(md5) !== "undefined") {
			clone.id = md5(clone.id);
		}
		clone._container = null;
		return clone;
	}
	dblclick(ev) {
	}
	click(ev) {
	}
	
	delete(ev) {
		// this.parent.deleteRESTRequestMenu(this);
	}
	copy(ev) {
		// this.parent.copyRESTRequestMenu(this);
	}
	activate() {
		this._container.style.border = "2px solid #000";
		this.container.after(this.toolContainer);
	}
	desactivate() {
		this.container.style.border = "";
		if (this.toolContainer.parentNode) {
			this.toolContainer.parentNode.removeChild(this.toolContainer);
		}
	}
	createOrUpdateDOM() {
		var self = this;
		if (!this._container) {
			this._container = document.createElement('div');
			Object.defineProperty(this, '_container', { enumerable: false });
			this._container.id = this.id;
			this._container.addEventListener('click', function(e) {
				self.click(e);
			});
			this._container.addEventListener('dblclick', function(e) {
				self.dblclick(e);
			});
			 
		} else {
			this.empty();
			while (this._container.classList.length > 0) {
			   this._container.classList.remove(this._container.classList.item(0));
			}
		}
		this._classArray.forEach(function (className) {
			self._container.classList.add(className);
		});
		if (this.innerHTML) {
			this._container.innerHTML = this.innerHTML;
		}
		this._container.onmouseover = this.onMouseOver.bind(this);
		this._container.onmouseout = this.onMouseOut.bind(this);
		
		if (!this.toolContainer) {
			this.toolContainer = document.createElement('div');
			//this.toolContainer.style.position = 'absolute';
			//this.toolContainer.style.left = '45%';
			//this.toolContainer.style.top = '-40px';
			this.toolContainer.style.marginLeft = '45%';
			this.toolContainer.style.zIndex = "100";
		}
		if (!this.imgCopy) {
			this.imgCopy = document.createElement('img');
			this.imgCopy.src = "./image/editor-copy.png";
			/*this.imgCopy.style.position = 'absolute';
			this.imgCopy.style.left = '50%';
			this.imgCopy.style.top = '-35px';*/
			this.imgCopy.style.maxWidth = '30px';
			// this.imgCopy.style.display = "left";
			this.imgCopy.onclick = this.copy.bind(this);
			this.toolContainer.appendChild(this.imgCopy);
		}
		if (!this.imgDelete) {
			this.imgDelete = document.createElement('img');
			this.imgDelete.src = "./image/editor-delete.png";
			/*this.imgDelete.style.position = 'absolute';
			this.imgDelete.style.left = '45%';
			this.imgDelete.style.top = '5px';*/
			this.imgDelete.style.maxWidth = '30px';
			// this.imgDelete.style.display = "left";	
			this.imgDelete.onclick = this.delete.bind(this);
			this.toolContainer.appendChild(this.imgDelete);
		}
		
		
		return this._container;
	}
	onMouseOut (ev) {
	
	}
	onMouseOver (ev) {
	
	}
	getTarget() {
		return this;
	}
	mustBeRemoveFromParent() {
		return true;
	}
	empty() {
		while(this.container.firstChild){
			this.container.removeChild(this.container.firstChild);
		}
	}
	setContent(content) {
		this.empty();
		this.container.appendChild(content);
	}
	get container() {
		if (!this._container) {
			this.createOrUpdateDOM();
		}
		return this._container;
	}
	get editor() {
		if (this._parent) {
			return this._parent.editor;
		}
		return null;
	}
	get parent() {
		return this._parent;
	}
	set parent(parent) {
		this._parent = parent;
	}
}

class Dropable extends Container {
	constructor(parent) {
		super(parent);
		return this;
	}
	drop(ev) {
		ev.preventDefault();
		return ev.dataTransfer.getData("text");
	}
	dragOver(ev) {
		ev.preventDefault();
	}
	dragEnter(ev) {
	
	}
	dragLeave(ev) {
	
	}
	createOrUpdateDOM() {
		super.createOrUpdateDOM();
		this.container.ondrop = this.drop.bind(this);
		this.container.ondragover = this.dragOver.bind(this);
		return this.container;
	}
}

class Draggable extends Container {
	constructor(parent) {
		super(parent);
		return this;
	}
	drag(ev) {
		ev.dataTransfer.setData("text", this.id);
		this.editor.dragObject = this; // dataTransfer is not available in dragOver event
	}	
	createOrUpdateDOM() {
		super.createOrUpdateDOM();
		this.container.setAttribute('draggable', "true");
		this.container.ondragstart = this.drag.bind(this);
		return this.container;
	}
}

class DropZoneContainer extends Container {
	constructor(parent) {
		super(parent);
		this.class = 'RestesterUI-dropzone-container';
		this.widgetArray = [];
		this._authorizedClassArray = [];
		Object.defineProperty(this, '_authorizedClassArray', { enumerable: false });
		this._dropZoneJunction = DropZoneJunction;
		Object.defineProperty(this, '_dropZoneJunction', { enumerable: false });
		return this;
	}
	get widgets() {
		return this.widgetArray;
	}
	get authorizedClass() {
		return this._authorizedClassArray;
	}
	getPreviousWidgets(w) {
		var maxIndex = this.widgets.indexOf(w);
		if (maxIndex === -1) {
			return this.widgets;
		}
		return this.widgets.filter(function(widget, i) { return i < maxIndex});
	}
	wrap(target) {
		return target;
	}
	removeWidget(widget, createOrUpdateDOM = false) {
		if (this.widgetArray.indexOf(widget) === -1) {
			alert('An error has occured. Please, try later.');
			return false;
		}
		widget.parent = null;
		this.widgetArray.splice(this.widgetArray.indexOf(widget), 2);
		if (createOrUpdateDOM) {
			this.createOrUpdateDOM();
		}
	}
	addWidget(widget, from, clone) {
		var internalMove = (widget.parent == this);
		if (from && this.widgetArray.indexOf(from) === -1) {
			alert('An error has occured. Please, try later.');
			return false;
		}
		if (widget.parent && widget.mustBeRemoveFromParent()) {
			widget.parent.removeWidget(widget, !internalMove);
		}
		var target = this.wrap(widget.getTarget());
		target.parent = this;
		if (from) {
			if (!(target instanceof this._dropZoneJunction)) {
				if (from instanceof this._dropZoneJunction) {
					this.widgetArray.splice(this.widgetArray.indexOf(from) + 1, 0, target, new this._dropZoneJunction(this));
				} else {
					this.widgetArray.splice(this.widgetArray.indexOf(from) + 1, 0, new this._dropZoneJunction(this), target);
				}
			} else {
				this.widgetArray.splice(this.widgetArray.indexOf(from) + 1, 0, target);
			}
		} else {
			if (!(target instanceof this._dropZoneJunction)) {
				if (this.widgetArray.length == 0) {
					this.widgetArray.push(new this._dropZoneJunction(this));
				}
			}
			this.widgetArray.push(target);
			if (!(target instanceof this._dropZoneJunction)) {
				this.widgetArray.push(new this._dropZoneJunction(this));
			}
		}
		this.createOrUpdateDOM();
	}
	isAuthorizdClass() {
		var self = this;
		return (this.editor.dragObject && this._authorizedClassArray.some(function(authorizedClass) { 
			return self.editor.dragObject instanceof authorizedClass;
		}));
	}
	createOrUpdateDOM() {
		var self = this;
		super.createOrUpdateDOM();
		this.widgetArray.forEach(function(widget) {
			widget.createOrUpdateDOM();
			self.container.appendChild(widget.container);
		});
		return this.container;
	}
}

class DropZoneJunction extends Dropable  {
	constructor(parent) {
		super(parent);
		this.class = ['RestesterUI-drop-zone'];
		return this;
	}
	drop(ev) {
		var id = super.drop(ev);
		var widget = this.editor.getWidget(id);
		if (widget) {
			this.addWidget(widget);
			ev.stopPropagation();
		}
		this.dragLeave(ev);
	}
	onMouseOver (ev) {
		// this.editor.setCurrentElement(this);
		ev.stopPropagation();
	}
	addWidget(widget) {
		return this.parent.addWidget(widget, this);
	}
	dragOver(ev) {
		this.dragEnter(ev);
	}
	dragEnter(ev) {
		if  (this.parent.isAuthorizdClass()) {
			ev.preventDefault();
			this.class.push('RestesterUI-drop-zone-dropover');
			this.createOrUpdateDOM();
		}
	}
	dragLeave(ev) {
		if  (this.parent.isAuthorizdClass()) {
			this.class = this.class.filter(function (className) { return className != 'RestesterUI-drop-zone-dropover'; });
			this.createOrUpdateDOM();
		}
	}
	createOrUpdateDOM() {
		super.createOrUpdateDOM();
	}
}

class WidgetStep extends Draggable {
	constructor(parent, data) {
		super(parent);
		var self = this;
		this.class = 'RestesterUI-structure-template-container';
		this._authorizedClassArray = [/*Content, ContentTemplate*/];
		Object.defineProperty(this, '_authorizedClassArray', { enumerable: false });
		this._dropZoneJunction = DropZoneJunction;
		Object.defineProperty(this, '_dropZoneJunction', { enumerable: false });
		this.subContainer = null;
		if (!data) {
			data = {};
		}
		this.data = data;
		if (!this.data.id) {
			this.data.id = this.id;
		}
		return this;
	}
	mustBeRemoveFromParent() {
		return true;
	}
	manage(step) {
		return false;
	}
	delete() {
		this.parent.deleteMenu(this);
	}
	copy() {
		this.parent.copyMenu(this);
	}
	onMouseOver (ev) {
		this._container.style.border = "2px solid #000";
		ev.stopPropagation();
	}
	onMouseOut (ev) {
		if (this.editor.getCurrentElement() !== this) {
			this._container.style.border = "";
		}
		ev.stopPropagation();		
	}
	click(ev) {
		this.editor.setCurrentElement(this);
	}
	createOrUpdateDOM() {
		var self = this;
		super.createOrUpdateDOM();		
		return this.container;
	}
	generate(options) {
		var result = {html: ''};
		return result;
	}
	
	run(callback) {
		callback({status: 0, message: 'OK'});
	}
}


class ScriptStep extends WidgetStep {
	constructor(parent, data) {
		super(parent, data);
		this.myClass = ScriptStep;
		Object.defineProperty(this, 'myClass', { enumerable: false });
		this.editorScript = null;
		Object.defineProperty(this, 'editorScript', { enumerable: false });
		this.codeMirrorScript = null;
		Object.defineProperty(this, 'codeMirrorScript', { enumerable: false });
		if (!this.data.name) {
			this.data.name = 'Script name';
		}
		if (!this.data.script) {
			this.data.script = ' return \'\'; ';
		}
		this.inputName = null;
		Object.defineProperty(this, 'inputName', { enumerable: false });
		this.value = null;
		Object.defineProperty(this, 'value', { enumerable: false });
		return this;
	}
	manage(step) {
		if (step.name && step.name === 'getAssertList') {
			return [{id: this.id, name: this.data.name}];
		}
		if (step.name && step.name === 'getAssertValue' 
			&& (
				(step.value && step.value === this.id) || (!step.value)
				)) {
			return {value: this.value, name: this.data.name};
		}
	}
	run(callback) {
		var operands = [null];
		var operandValues = [];
		var assertionPos = this.editor.template.widgets.indexOf(this);
		for (var index = assertionPos-1; index >=0; index--) {
			var widget = this.editor.template.widgets[index];
			if (!(widget instanceof WidgetStep)) continue;
			var dataToExtract = widget.manage({name: 'getAssertValue'});
			if (dataToExtract) {
				operands.push(dataToExtract.name);
				operandValues.push(dataToExtract.value);
			}
		}
		operands.push(this.data.script);
		var runScript = new (Function.prototype.bind.apply(Function, operands));
		try {
			this.value = runScript.apply(null, operandValues);
		} catch(e) {
			return callback({status: 1, message: '<b>' + this.inputName.value+'</b> failed:' + e.message});
		}		
		return callback({status: 0, message: 'Set <b>' + this.inputName.value+'</b> = '+this.value});
	}
	fire(eventName, data) {
	}
	changeName() {
		this.data.name = this.inputName.value;
	}
	createOrUpdateDOM() {
		var self = this;
		if (this._container) {
			return this._container;
		}
		super.createOrUpdateDOM();
		this._container.classList.add('RestesterUI-border1');
		this._container.classList.add('RestesterUI-tabber');
		this._container.id = this.id;
		this._container.setAttribute('data-name', 'script');
		
		var requestContainer = document.createElement('div');
		this._container.appendChild(requestContainer);
		requestContainer.classList.add('RestesterUI-widget');
		
		requestContainer.appendChild(this.createElement('b', 'JavaScript Script'));
		this.inputName = this.createInput({type : "text", name: "name", value: this.data.name, onchange: this.changeName.bind(this)});
		requestContainer.appendChild(this.inputName);
		
		requestContainer.appendChild(document.createElement('br'));
		requestContainer.appendChild(document.createElement('br'));

		this.editorScript = document.createElement('textarea');
		this.editorScript.innerHTML = this.data.script;
		requestContainer.appendChild(this.editorScript);
		setTimeout(function () {
			self.initEditor();
		}, 1);
		requestContainer.appendChild(document.createElement('br'));
		requestContainer.appendChild(document.createTextNode('Note: You can use parameters you have extracted.'));
	}
	initEditor() {
		var self = this;
		this.codeMirrorScript = CodeMirror.fromTextArea(this.editorScript, { format: 'json', lineNumbers: true, viewportMargin: Infinity});
		this.codeMirrorScript.setSize(null, 100);
		this.codeMirrorScript.on ('change', function () {
			self.data.script = self.codeMirrorScript.getValue("\n");
		});
	}
}


class AssertionStep extends WidgetStep {
	constructor(parent, data) {
		super(parent, data);
		this.myClass = AssertionStep;
		Object.defineProperty(this, 'myClass', { enumerable: false });
		this.paramSelect = null;
		Object.defineProperty(this, 'paramSelect', { enumerable: false });
		this.subParamInput = null;
		Object.defineProperty(this, 'subParamInput', { enumerable: false });
		this.operatorSelect = null;
		Object.defineProperty(this, 'operatorSelect', { enumerable: false });
		this.valueInput = null;
		Object.defineProperty(this, 'valueInput', { enumerable: false });
		this.inputName = null;
		Object.defineProperty(this, 'inputName', { enumerable: false });
		if (!this.data.name) {
			this.data.name = 'Assertion name';
		}
		return this;
	}
	run(callback) {
		var param1 = null;
		var param1Obj = null;
		var param2 = this.valueInput.value;
		var operator = this.operatorSelect.value;
		var result = null;
		var assertionPos = this.editor.template.widgets.indexOf(this);
		for (var index = assertionPos-1; index >=0; index--) {
			var widget = this.editor.template.widgets[index];
			if (!(widget instanceof WidgetStep)) continue;
			param1Obj = widget.manage({name: 'getAssertValue', value: this.paramSelect.value});
			if (param1Obj) {
				break;
			}
		}
		if (param1Obj === null) {
			return callback({status: 1, widget: this, message: 'Parameter <b>'+this.paramSelect.value+'</b> not found in previous steps'});
		}
		param1 = param1Obj.value;
		if (operator.indexOf('number') !== -1) {
			param1 = parseFloat(param1Obj.value);
			param2 = parseFloat(param2);
		}
		operator = operator.replace('number', '');
		switch(operator) {
			case '<': result = (param1 < param2); break;
			case '<=': result = (param1 <= param2); break;
			case '=': result = (param1 == param2); break;
			case '>=': result = (param1 >= param2); break;
			case '>': result = (param1 > param2); break;
			case '!=': result = (param1 != param2); break;
			case 'contains': result = (param1.indexOf(param2) !== -1); break;
			case 'notcontains': result = (param1.indexOf(param2) === -1); break;
			case 'regex': result = ((new RegExp( param2 /* flag */)).exec(param1) !== null); break;
		}
		if (!result) {
			return callback({status: 1, widget: this, message: '<b>' + param1Obj.name +'</b> not '+operator+' '+param2});
		}
		return callback({status: 0, message: 'Check <b>' + param1Obj.name +'</b> '+operator+' '+param2});
	}
	fire(eventName, data) {
		switch(eventName) {
			case 'ExtractionStep.changeName':
				if (this.paramSelect){
					for (var i = 0; i < this.paramSelect.length; i++) {
						var option = this.paramSelect.options[i];
						if (option.value == data.id) {
							option.text = data.name;
						}
					}
				}
				break;
			case 'ExtractionStep.add':
				var option=document.createElement("option");
				option.text=data.name;
				option.value=data.id;
				if (this.paramSelect) {
					this.paramSelect.add(option, null);
				}
				break;
			case 'ExtractionStep.remove':
				var pos = null;
				if (this.paramSelect) {
					for (var i = 0; i < this.paramSelect.length; i++) {
						var option = this.paramSelect.options[i];
						if (option.value == data.id) {
							pos = i;
						}
					}	
				}
				if (pos !== null) {
					this.paramSelect.remove(pos);
				}
				break;
		}
	}
	changeName() {
		this.data.name = this.inputName.value;
	}
	createOrUpdateDOM() {
		var self = this;
		if (this._container) {
			return this._container;
		}
		super.createOrUpdateDOM();
		this._container.classList.add('RestesterUI-border1');
		this._container.classList.add('RestesterUI-tabber');
		this._container.id = this.id;
		this._container.setAttribute('data-name', 'assertion');
		
		var requestContainer = document.createElement('div');
		this._container.appendChild(requestContainer);
		requestContainer.classList.add('RestesterUI-widget');
		
		requestContainer.appendChild(this.createElement('b', 'Assertion'));
		
		this.inputName = this.createInput({type : "text", name: "name", value: this.data.name, onchange: this.changeName.bind(this)});
		requestContainer.appendChild(this.inputName);
		
		requestContainer.appendChild(document.createElement('br'));
		requestContainer.appendChild(document.createElement('br'));
		
		this.paramSelect = document.createElement('select');
		this.paramSelect.name = 'param';
		requestContainer.appendChild(this.paramSelect);
		var assertionAll = [];
		var assertionPos = this.editor.template.widgets.indexOf(this);
		for (var index = assertionPos-1; index >=0; index--) {
			var widget = this.editor.template.widgets[index];
			if (!(widget instanceof WidgetStep)) continue;
			var asserts = widget.manage({name: 'getAssertList'});
			if (asserts && asserts.length) {
				asserts.forEach(function (assert) {
					var matchList = assertionAll.filter(function (a) { return a.id == assert.id;});
					if (matchList && matchList.length) {
						return;
					}
					assertionAll.push(assert);
					var option=document.createElement("option");
					option.text=assert.name;
					option.value=assert.id;
					if (self.data.param == assert.id) {
						option.selected = true;
					}
					self.paramSelect.add(option, null);
				});
			}
		}
		this.paramSelect.onchange = function () { 
			self.data.param = self.paramSelect.value; 
			var matchList = assertionAll.filter(function (assert) { return assert.id == self.data.param;});
			if (matchList && matchList.length && matchList[0].input) {
				self.subParamInput.style.display = '';
			} else {
				self.subParamInput.style.display = 'none';
			}
		};
		this.subParamInput = this.createInput({type : "text", name: "subParam", value: this.data.subParam});
		//placeholder this.subParamInput
		requestContainer.appendChild(this.subParamInput);
		this.subParamInput.onchange = function () { self.data.subParam = self.subParamInput.value; };
		
		this.paramSelect.onchange();
		
		this.operatorSelect = document.createElement('select');
		requestContainer.appendChild(this.operatorSelect);
		this.operatorSelect.name = 'operator';
		var operators = [{id:'<', msg:'Less than'}, 
		{id:'<=', msg:'Less or equals than'}, 
		{id:'=', msg:'Equals'}, 
		{id:'>=', msg:'Greater or equals than'},
		{id:'>', msg:'Greater than'},
		{id:'!=', msg:'Not equals'}, 
		];
		operators.forEach(function(operator) {
			var option=document.createElement("option");
			option.text=operator.msg + ' (number)';
			option.value=operator.id + 'number';
			if (self.data.operator == operator.id + 'number') {
				option.selected = true;
			}
			self.operatorSelect.add(option, null);
		});
		[{id:'contains', msg:'Contains'}, {id:'notcontains', msg:'Not contains'}, {id:'regex', msg:'Regex'}].forEach(function(operator) {
			var option=document.createElement("option");
			option.text=operator.msg + ' (string)';
			option.value=operator.id;
			if (self.data.operator == operator.id) {
				option.selected = true;
			}
			self.operatorSelect.add(option, null);
		});
		operators.forEach(function(operator) {
			var option=document.createElement("option");
			option.text=operator.msg + ' (string)';
			option.value=operator.id;
			if (self.data.operator == operator.id) {
				option.selected = true;
			}
			self.operatorSelect.add(option, null);
		});
		this.operatorSelect.onchange = function () { self.data.operator = self.operatorSelect.value; };
		
		this.valueInput = this.createInput({type : "text", name: "value", value: this.data.value});
		requestContainer.appendChild(this.valueInput);
		this.valueInput.onchange = function () { self.data.value = self.valueInput.value; };
	}
}
class ExtractionStep extends WidgetStep {
	constructor(parent, data) {
		super(parent, data);
		this.myClass = ExtractionStep;
		Object.defineProperty(this, 'myClass', { enumerable: false });
		if (!this.data.name) {
			this.data.name = 'Parameter name';
		}
		this.inputName = null;
		this.value = null;
		Object.defineProperty(this, 'inputName', { enumerable: false });
		this.originSelect = null;
		Object.defineProperty(this, 'originSelect', { enumerable: false });
		this.subParamInput = null;
		Object.defineProperty(this, 'subParamInput', { enumerable: false });
		this.methodSelect = null;
		Object.defineProperty(this, 'methodSelect', { enumerable: false });
		// this.checkboxJson = null;
		// Object.defineProperty(this, 'checkboxJson', { enumerable: false });
		this.valueInput = null;
		Object.defineProperty(this, 'valueInput', { enumerable: false });
		return this;
	}
	manage(step) {
		if (step.name && step.name === 'getAssertList') {
			return [{id: this.id, name: this.data.name}];
		}
		if (step.name && step.name === 'getAssertValue' 
			&& (
				(step.value && step.value === this.id) || (!step.value)
				)) {
			return {value: this.value, name: this.data.name};
		}
	}
	changeName() {
		this.data.name = this.inputName.value;
		this.editor.fire('ExtractionStep.changeName', this.data);
	}
	delete(ev) {
		this.editor.fire('ExtractionStep.remove', this.data);		
		super.delete(ev);
	}
	xpath(string, xpath) {
		/*if (!document.evaluate) {    // IE
			throw new Exception("Your browser does not support the evaluate method");
		}*/
		var getElementsByXPath = function (xpath, elt)
		{
			var results = [];
			var nsResolver = document.createNSResolver( elt.ownerDocument == null ? elt.documentElement : elt.ownerDocument.documentElement );
			var xPathRes = document.evaluate(xpath, elt, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			for (var i = 0; i < xPathRes.snapshotLength; i++) {
				var element = xPathRes.snapshotItem (i);
				if (element instanceof Attr) results.push(element.nodeValue);
				else if (element instanceof Element && element.outerHTML) results.push(element.outerHTML);
				else if (element instanceof Text) results.push(element.textContent);
				else results.push(element);
			}
			return results;
		};

		var xml = (new DOMParser()).parseFromString(string, "text/xml"); 
		var results = getElementsByXPath(xpath, xml);
		var ResultTxt = '';
		results.forEach(function(result) {
			ResultTxt += result;
		});
		return ResultTxt;
	}	
	css(string, css) {
		var xml = (new DOMParser()).parseFromString(string, "text/xml"); 
		return new XMLSerializer().serializeToString(xml.querySelector(css));
	}
	regex(string, regex, type) {
		var regex = new RegExp( regex /*,flag*/);
		var m = null;
		if ((m = regex.exec(string)) !== null) {
			if (type == 'matched') return m[0]; 
			else return m[1]; 
		}
		return '';
	}
	jsonpath(string, jsonpath) {
		var json = JSON.parse(string);
		if (json === false) {
			return '';
		}
		var results = JSONPath({path: jsonpath, json: json});
		if (results.length == 0) {
			return '';
		}
		if (typeof results[0] == "string") return results[0];
		else return JSON.stringify(results[0]);
		// else return JSON.stringify(results);
	}
	run(callback) {
		this.value = null;
		var fieldToExtract = this.originSelect.value;
		var maskToExtract = this.valueInput.value;
		var dataToExtract = null;
		// get previous request
		var assertionPos = this.editor.template.widgets.indexOf(this);
		for (var index = assertionPos-1; index >=0; index--) {
			var widget = this.editor.template.widgets[index];
			if (!(widget instanceof WidgetStep)) continue;
			dataToExtract = widget.manage({name: 'getExtractValue', value: fieldToExtract});
			if (dataToExtract) {
				break;
			}
		}
		if (dataToExtract === null) {
			return callback({status: 1, widget: this, message: 'Can not extract <b>'+this.data.name+'</b>, check the previous steps contains this field'});
		}
		try {
			switch (this.methodSelect.value) {
				case 'xpath': this.value = this.xpath(dataToExtract.value, maskToExtract); break;
				case 'jsonpath': this.value = this.jsonpath(dataToExtract.value, maskToExtract); break;
				case 'css': this.value = this.css(dataToExtract.value, maskToExtract); break;
				case 'regex_matched': this.value = this.regex(dataToExtract.value, maskToExtract, 'matched'); break;
				case 'regex_parenthesis': this.value = this.regex(dataToExtract.value, maskToExtract, 'parenthesis'); break;
			}
		} catch(e) {
			return callback({status: 1, message: 'Extract of <b>'+this.data.name+'</b> failed: '+e.message});			
		}
		
		return callback({status: 0, message: 'Set <b>' + this.data.name +'</b> = '+this.value.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {return '&#'+i.charCodeAt(0)+';'; }) + ' '});
	}
	createOrUpdateDOM() {
		var self = this;
		if (this._container) {
			return this._container;
		}
		super.createOrUpdateDOM();
		this._container.classList.add('RestesterUI-border1');
		this._container.classList.add('RestesterUI-tabber');
		this._container.id = this.id;
		this._container.setAttribute('data-name', 'extraction');
		
		var requestContainer = document.createElement('div');
		this._container.appendChild(requestContainer);
		requestContainer.classList.add('RestesterUI-widget');
		
		requestContainer.appendChild(this.createElement('b', 'Extraction'));
		this.inputName = this.createInput({type : "text", name: "name", value: this.data.name, onchange: this.changeName.bind(this)});
		requestContainer.appendChild(this.inputName);
		requestContainer.appendChild(document.createElement('br'));
		requestContainer.appendChild(document.createElement('br'));
		
		
		
		this.editor.fire('ExtractionStep.add', this.data);
		
		this.originSelect = document.createElement('select');
		this.originSelect.name = 'origin';
		requestContainer.appendChild(this.originSelect);
		/*[{id:'body', msg:'Response body'}, {id:'header', msg:'Response header'}, {id:'httpCode', msg:'Response HTTP code'}].forEach(function(origin) {
			var option=document.createElement("option");
			option.text=origin.msg;
			option.value=origin.id;
			if (self.data.origin == origin.id) {
				option.selected = true;
			}
			self.originSelect.add(option, null);
		});*/
		var extractAll = [];
		var assertionPos = this.editor.template.widgets.indexOf(this);
		for (var index = assertionPos-1; index >=0; index--) {
			var widget = this.editor.template.widgets[index];
			if (!(widget instanceof WidgetStep)) continue;
			var asserts = widget.manage({name: 'getExtractList'});
			if (asserts && asserts.length) {
				asserts.forEach(function (assert) {
					extractAll.push(assert);
					var option=document.createElement("option");
					option.text=assert.name;
					option.value=assert.id;
					if (self.data.param == assert.id) {
						option.selected = true;
					}
					self.originSelect.add(option, null);
				});
			}
		}
		this.originSelect.onchange = function () { self.data.param = self.originSelect.value; };
		
		
		
		this.originSelect.onchange = function () { 
			self.data.param = self.originSelect.value; 
			var matchList = extractAll.filter(function (assert) { return assert.id == self.data.param;});
			if (matchList && matchList.length && matchList[0].input) {
				self.subParamInput.style.display = '';
			} else {
				self.subParamInput.style.display = 'none';
			}
		};
		this.subParamInput = this.createInput({type : "text", name: "subParam", value: this.data.subParam});
		//placeholder this.subParamInput
		requestContainer.appendChild(this.subParamInput);
		this.subParamInput.onchange = function () { self.data.subParam = self.subParamInput.value; };
		
		this.originSelect.onchange();
		
		
		this.methodSelect = document.createElement('select');
		requestContainer.appendChild(this.methodSelect);
		this.methodSelect.name = 'method';
		[{id:'xpath', msg:'XPath'}, {id:'jsonpath', msg:'JSON Path'}, {id:'css', msg:'CSS selector'}, {id:'regex_matched', msg:'Regex (matched text)'}, {id:'regex_parenthesis', msg:'Regex (1st capturing group)'}].forEach(function(method) {
			var option=document.createElement("option");
			option.text=method.msg;
			option.value=method.id;
			if (self.data.method == method.id) {
				option.selected = true;
			}
			self.methodSelect.add(option, null);
		});
		
		this.valueInput = this.createInput({type : "text", name: "value", value: this.data.value});
		requestContainer.appendChild(this.valueInput);
		this.valueInput.onchange = function () { self.data.value = self.valueInput.value; };
		
		/*var checkboxJsonContainer = document.createElement('div');
		requestContainer.appendChild(checkboxJsonContainer);
		this.checkboxJson = document.createElement('input');
		this.checkboxJson.type = 'checkbox';
		this.checkboxJson.value = 'value';
		this.checkboxJson.id = String(new Date().getTime()) + Math.floor(Math.random() * 1000000);
		this.checkboxJson.checked = this.data.returnValueForJson === true;
		this.checkboxJson.onchange = function () { 
			self.data.returnValueForJson = self.checkboxJson.checked; 
		};
		checkboxJsonContainer.appendChild(this.checkboxJson);
		var labelJson = document.createElement('label');
		labelJson.setAttribute('for', this.checkboxJson.id);
		labelJson.appendChild(document.createTextNode('Return the value instead of an array *'));
		checkboxJsonContainer.appendChild(labelJson);
		
		var jsonInfoContainer = document.createElement('div');
		requestContainer.appendChild(jsonInfoContainer);
		jsonInfoContainer.appendChild(document.createTextNode('* JSONPath returns always an array. If you check this option, it will returns the value instead an array.'));	
		*/
		this.methodSelect.onchange = function () { 
			self.data.method = self.methodSelect.value; 
			/*if (self.data.method === 'jsonpath') {
				jsonInfoContainer.style.display = '';
				checkboxJsonContainer.style.display = '';
			} else {
				jsonInfoContainer.style.display = 'none';
				checkboxJsonContainer.style.display = 'none';
			}*/
		};
		this.methodSelect.onchange();
	}
}
class RESTRequestStep extends WidgetStep {
	constructor(parent, data) {
		super(parent, data);
		this.myClass = RESTRequestStep;
		Object.defineProperty(this, 'myClass', { enumerable: false });
		if (!this.data.id) {
			this.data.id = 'editor' + String(new Date().getTime()) + Math.floor(Math.random() * 1000000);
			if (typeof(md5) !== "undefined") {
				this.data.id = md5(this.data.id);
			}
		}
		/*if (!this.data.name) {
			this.data.name = 'Untitled request';
		}*/
		this._container = null;
		
		this.headerContainer = null;
		this.responseContainer = null;
		this.messageContainer = null;
		this.messageResponseContainer = null;
		
		this.editorRequestBodyTextarea = null;
		Object.defineProperty(this, 'editorRequestBodyTextarea', { enumerable: false });
		this.editorResponseHeadersTextarea = null;
		Object.defineProperty(this, 'editorResponseHeadersTextarea', { enumerable: false });
		this.editorResponseBodyTextarea = null;
		Object.defineProperty(this, 'editorResponseBodyTextarea', { enumerable: false });
		
		this.codeMirrorRequestBody = null;
		Object.defineProperty(this, 'codeMirrorRequestBody', { enumerable: false });
		this.codeMirrorResponseHeaders = null;
		Object.defineProperty(this, 'codeMirrorResponseHeaders', { enumerable: false });
		this.codeMirrorResponseBody = null;
		Object.defineProperty(this, 'codeMirrorResponseBody', { enumerable: false });
		
		this.inputName = null;
		Object.defineProperty(this, 'inputName', { enumerable: false });
		
		if (!this.data.name) {
			this.data.name = 'Request name';
		}
		
		this.method = null;
		this.url = null;
		this.headers = [];
		this.username = null;
		this.password = null;
		
		this.headerName = null;
		this.headerValue = null;

		this.spanTab = null;
		
		this.response = {};
		this.response.statusCode = null;
		this.response.getHeader = function () { return ''; };
		this.response.headers = null;
		this.response.body = null;
		
		return this;
	}
	manage(step) {
		if (step.name && step.name === 'getAssertList' || step.name === 'getExtractList') {
			return [{id: 'body', name: 'Response body', input: false}, {id: 'header', name: 'Response header', input: true}];
		}
		if (step.name && (step.name === 'getAssertValue' || step.name === 'getExtractValue') && step.value) {
			if (step.value == 'body') return {value: this.response.body, name: 'Response body'};
			if (step.value == 'header' && step.subvalue) return {value: this.response.getHeader(step.subvalue), name: 'Response header ' +step.subvalue};
			if (step.value == 'header' && !step.subvalue) return {value: this.response.headers, name: 'Response header'};
		}
	}
	saveHeaders() {
		var search = {};
		this.getSearchObject(search);
		this.data.headers = search.headers;
	}
	getSearchObject(search) {
		if (!search) {
			search = {};
		}
		search.id = this.data.id;
		// search.name = this.inputName.value;
		search.method = this.method.value;
		search.url = this.url.value;
		search.body = this.codeMirrorRequestBody.getValue("\n");
		// search.local = document.getElementById('place-local').checked;
		search.username = this.username.value;
		search.password = this.password.value;
		search.headers = [];
		var headerValue = []; 
		var headerValueArr = this.headerContainer.querySelectorAll('input[name="header_value"]');
		for (var i = 0; i < headerValueArr.length; ++i) {
		  headerValue.push(headerValueArr[i]);
		}
		var headerContainerArr = this.headerContainer.querySelectorAll('input[name="header_name"]');
		for (var i = 0; i < headerContainerArr.length; ++i) {
			search.headers.push({name: headerContainerArr[i].value, value: headerValue[i].value}); 
		}
		return search;
	}
	emptyMessages() {
		[this.messageContainer, this.messageResponseContainer].forEach(function (c) {
			c.innerText = '';
			c.style.display = 'none';
			c.classList.remove('RestesterUI-editor-valid', 'RestesterUI-editor-error', 'RestesterUI-editor-inprogress');
		});
	}
	/*setMessage(type, message) {
		return; // todo
		while (this.message.classList.length > 0) {
		   this.message.classList.remove(this.message.classList.item(0));
		}
		this.message.classList.add(type);
		this.message.innerText = message;
		this.message.style.display = '';
	}
	resetMessage() {
		return; // todo
		while (this.message.classList.length > 0) {
		   this.message.classList.remove(this.message.classList.item(0));
		}
		this.message.innerText = '';
		this.message.style.display = 'none';
	}*/
	formatResponse(httpCode, message) {
		var container = document.createElement('div');
		container.classList.add('RestesterUI-step-container');
		var http = document.createElement('span');
		container.appendChild(http);
		if (!httpCode || parseInt(httpCode) >= 400 && parseInt(httpCode) <= 599) http.classList.add('RestesterUI-http-ko');
		else http.classList.add('RestesterUI-http');
		http.innerHTML = httpCode;
		var method = document.createElement('span');
		container.appendChild(method);
		method.classList.add('RestesterUI-run-method');
		method.innerHTML = this.method.value;
		var name = document.createElement('span');
		container.appendChild(name);
		name.classList.add('RestesterUI-run-name');
		name.innerHTML = this.data.name;
		/*var subc = document.createElement('div');
		container.appendChild(subc);
		subc.appendChild(document.createTextNode(message));*/
		return container;
	}
	run(callback) {
		try {
			return this.send(null, callback);
		} catch(e) {
			callback({status:1, message: this.formatResponse(null, e.message)});
		}
	}
	send(event, callback) {
		var self = this;
		this.response = {};
		this.response.statusCode = null;
		this.response.headers = null;
		this.response.getHeader = function () { return ''; };
		this.response.body = '';
		var search = this.getSearchObject();
		var local = true; // todo document.getElementById('place-local').checked;
		// services.storage.setItem('rest-client-online.search', JSON.stringify(search));
		if (search.username != '') {
			search.headers.push({name:'Authorization', value:'Basic '+btoa(search.username+':'+search.password)}); 
		}
		if (!callback) {
			this.openTabber('Response' + this.data.id, 'tab-sub-menu-select', 'div[data-tab="'+this.data.id+'"]');
		}
		this.emptyMessages();
		
		this.codeMirrorResponseHeaders.setValue('');
		this.codeMirrorResponseBody.setValue('');
		
		var request = {method:search.method, url:search.url, headers:search.headers, body: search.body};
		/*if (!local)
		{
			request = {method: 'POST', url: myDomain + '/rest-client-request', headers: [], body: JSON.stringify(request)};
		}*/
		
		this.messageContainer.innerText = "In progress...";
		this.messageContainer.classList.add('RestesterUI-editor-inprogress');
		this.messageContainer.style.display = '';
		
		var sendCallback = function(restResponse)  {
			self.emptyMessages();

			if (restResponse.headers) {
				self.codeMirrorResponseHeaders.setValue(restResponse.headers);
			}
			if (restResponse.responseText) {
				self.codeMirrorResponseBody.setValue(restResponse.responseText);
			}
			
			self.response = {};
			self.response.statusCode = restResponse.status;
			self.response.headers = restResponse.headers;
			self.response.getHeader = function (headerName) { return restResponse.getResponseHeader(headerName); };
			self.response.body = restResponse.responseText;
			
			if (restResponse.status !== 200  && restResponse.status !== 201) {
				var errorMsg = "Request failed:\n";
				if (restResponse.error) {
					errorMsg += restResponse.error + "\n\n";
				}
				if (restResponse.status && restResponse.status !== 0 && restResponse.status !== undefined) {
					errorMsg += 'HTTP status code: '+restResponse.status + "\n";
				}
				if (local) {
					if (restResponse.status == 0) {
						errorMsg += "Note: Check CORS is enabled\n";
					}
				} else {
					errorMsg += "Note: Select send from the browser if it is a local REST API. Our server may be blacklisted.\n";
				}
				self.messageContainer.classList.add('RestesterUI-editor-error');
				self.messageContainer.style.display = '';
				self.messageContainer.innerText = errorMsg;
			} else {
				self.messageContainer.classList.add('RestesterUI-editor-valid');
				self.messageContainer.style.display = '';
				self.messageContainer.innerText = 'your request has been sent successfully ('+restResponse.status+')';
			}
			return callback ? callback({status: 0, widget: self, message: self.formatResponse(restResponse.status, restResponse.responseText.substring(0, 50))}) : null;
		};

		var xhr= new XMLHttpRequest();
		xhr.open(request.method, request.url, true);
		xhr.onreadystatechange= function() {
			if (this.readyState!==4) return;
			sendCallback({status:this.status, responseText:this.responseText, obj: this, headers: this.getAllResponseHeaders()});
		};
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		if (request.headers) {
			request.headers.forEach(function(header) {
				xhr.setRequestHeader(header.name, header.value);
			});
		}
		if (request.body) {
			xhr.send(request.body);
		} else {
			xhr.send();
		}
	}
	addHeader(ev, init) {
		var self = this;
		var div = document.createElement("div");
		this.headerContainer.appendChild(div);
		
		var nameInput = document.createElement("input");
		nameInput.setAttribute("type", "text");
		nameInput.setAttribute("name", "header_name");
		nameInput.value = this.headerName.value;
		nameInput.onchange = function () { this.saveHeaders(); };
		div.appendChild(nameInput);
		
		var valueInput = document.createElement("input");
		valueInput.setAttribute("type", "text");
		valueInput.setAttribute("name", "header_value");
		valueInput.value = this.headerValue.value;
		valueInput.onchange = function () { this.saveHeaders(); };
		div.appendChild(valueInput);
		
		var deleteInput = document.createElement("input");
		deleteInput.setAttribute("type", "button");
		deleteInput.name = 'deleteHeader';
		deleteInput.value = 'delete';
		deleteInput.onclick = function() {
			self.headerContainer.removeChild(div);
			self.saveHeaders();
		};
		div.appendChild(deleteInput);
		
		this.headerName.value = '';
		this.headerValue.value = '';
		if (!init) {
			this.saveHeaders();
		}
	}
	clone() {
		var cloneRequest = JSON.parse(JSON.stringify(this.getSearchObject()));
		cloneRequest.id = null;
		var request = new RESTRequestStep(this.parent, cloneRequest);
		request.parent = null;
		return request;
	}
	addClass(el, className) {
	  if (!el) return;
	  if (el.classList)
		el.classList.add(className)
	  else if (!hasClass(el, className)) el.className += " " + className
	}
	removeClass(el, className) {
	  if (!el) return;
	  if (el.classList)
		el.classList.remove(className)
	  else if (hasClass(el, className)) {
		var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
		el.className=el.className.replace(reg, ' ')
	  }
	}
	openTabber(tabber, className, selector) {
		if (!className) {
			className = 'RestesterUI-gray';
		}
		var i;
		var x;
		if (!selector) {
			x = this.container.getElementsByClassName("tabber");
		} else {
			x = this.container.querySelectorAll(selector);
		}
		
		for (i = 0; i < x.length; i++) {
			x[i].style.display = "none"; 
			this.removeClass(document.getElementById('button-'+x[i].id), className);
		}
		if (tabber) {
			var tabberContainer = document.getElementById(tabber);
			if (tabberContainer) {
				tabberContainer.style.display = "block"; 
			}
			this.addClass(document.getElementById('button-'+tabber), className);
		}
	}
	changeName() {
		this.data.name = this.inputName.value;
	}
	createOrUpdateDOM() {
		var self = this;
		if (this._container) {
			return this._container;
		}
		super.createOrUpdateDOM();
		this._container.classList.add('RestesterUI-border1');
		this._container.classList.add('RestesterUI-tabber');
		this._container.id = this.data.id;
		this._container.setAttribute('data-name', 'rest-client-request');

		var requestContainer = document.createElement('div');
		this._container.appendChild(requestContainer);
		requestContainer.classList.add('RestesterUI-widget');
		requestContainer.appendChild(this.createElement('b', 'REST Request'));
		
		this.inputName = this.createInput({type : "text", name: "name", value: this.data.name, onchange: this.changeName.bind(this)});
		requestContainer.appendChild(this.inputName);
		
		requestContainer.appendChild(document.createElement('br'));
		requestContainer.appendChild(document.createElement('br'));
		
		
		var actionContainer = document.createElement('div');
		actionContainer.classList.add('RestesterUI-clear');
		actionContainer.classList.add('RestesterUI-container-action');
		requestContainer.appendChild(actionContainer);
		actionContainer.appendChild(this.createElement('span', 'Method', {className: 'span'}));
		this.method =  document.createElement('select');
		actionContainer.appendChild(this.method);
		this.method.name = "method";
		this.method.setAttribute('data-identifier', this.data.id);
		
		['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].forEach(function(method) {
			var option=document.createElement("option");
			option.text=method;
			option.value=method;
			if (self.data.method == method) {
				option.selected = true;
			}
			self.method.add(option, null);
		});
		this.method.onchange = function () { self.data.method = self.method.value; };

		actionContainer.appendChild(this.createElement('span', 'URL', {className: 'span'}));
		this.url = this.createInput({type : "text", name: "url", value: this.data.url, className: 'url-auto'});
		actionContainer.appendChild(this.url);
		this.url.onchange = function () { self.data.url = self.url.value; };

		actionContainer.appendChild(this.createInput({type : "button", name: "send", value: "Test", onclick: this.send.bind(this), className: ['RestesterUI-button-action', 'right', 'span', 'medium']}));
		
		var menuContainer = document.createElement('div');	
		requestContainer.appendChild(menuContainer);
		['Authentication', 'Headers', 'Body', 'Response'].forEach(function (t) {
			var subMenuContainer = document.createElement('div');	
			menuContainer.appendChild(subMenuContainer);
			subMenuContainer.classList.add('RestesterUI-tab-sub-menu');
			subMenuContainer.appendChild(document.createTextNode(t));
			subMenuContainer.id = 'button-' + t + self.data.id;
			subMenuContainer.setAttribute('data-name', 'menu-' + t);
			subMenuContainer.onclick = function() {
				self.openTabber(t + self.data.id, 'RestesterUI-tab-sub-menu-select', 'div[data-tab="'+self.data.id+'"]');
			};
		});
		
		var authenticationContainer = document.createElement('div');
		requestContainer.appendChild(authenticationContainer);
		authenticationContainer.id = 'Authentication' + this.data.id;
		authenticationContainer.setAttribute('data-name', 'tab-Authentication');
		authenticationContainer.setAttribute('data-tab', this.data.id);
		authenticationContainer.classList.add('RestesterUI-container-action');
		authenticationContainer.appendChild(this.createElement('span', 'Basic Authentication'));
		var subauthenticationContainer = document.createElement('div');
		authenticationContainer.appendChild(subauthenticationContainer);
		authenticationContainer.style.display = 'none';
		this.username = this.createInput({type : "text", name: "username", value: this.data.username, className: 'RestesterUI-input-action'});
		this.username.onchange = function () { self.data.username = self.username.value; };
		subauthenticationContainer.appendChild(this.createElement('span', 'Username', {className: 'span'}));
		subauthenticationContainer.appendChild(this.username);		
		subauthenticationContainer.appendChild(this.createElement('span', 'Password', {className: 'span'}));
		this.password = this.createInput({type : "text", name: "password", value: this.data.password, className: 'RestesterUI-input-action'});
		this.password.onchange = function () { self.data.password = self.password.value; };
		subauthenticationContainer.appendChild(this.password);
					
		var headerContainer = document.createElement('div');
		requestContainer.appendChild(headerContainer);
		headerContainer.id = 'Headers' + this.data.id;
		headerContainer.setAttribute('data-tab', this.data.id);
		headerContainer.setAttribute('data-name', 'tab-Headers');
		headerContainer.classList.add('RestesterUI-container-action');
		headerContainer.appendChild(this.createElement('span', 'Headers'));
		headerContainer.style.display = 'none';
		var subHeaderContainer = document.createElement('div');
		headerContainer.appendChild(subHeaderContainer);
		subHeaderContainer.appendChild(this.createElement('span', 'Name', {className: 'span'}));
		this.headerName = this.createInput({type : "text", name: "headerName"});
		subHeaderContainer.appendChild(this.headerName);
		subHeaderContainer.appendChild(this.createElement('span', 'Value', {className: 'span'}));
		this.headerValue = this.createInput({type : "text", name: "headerValue"});
		subHeaderContainer.appendChild(this.headerValue);
		subHeaderContainer.appendChild(this.createInput({type : "button", name: "AddHeader",  value: "Add", onclick: this.addHeader.bind(this)}));
		this.headerContainer = document.createElement('div');
		headerContainer.appendChild(this.headerContainer);
		if (this.data.headers) {
			this.data.headers.forEach(function(header) {
				self.headerName.value = header.name;
				self.headerValue.value = header.value;
				self.addHeader(null, true);
			});
		}

		var bodyContainer = document.createElement('div');
		bodyContainer.id = 'Body' + this.data.id;
		bodyContainer.setAttribute('data-tab', this.data.id);
		bodyContainer.setAttribute('data-name', 'tab-Body');
		requestContainer.appendChild(bodyContainer);
		bodyContainer.classList.add('RestesterUI-container-action');
		// bodyContainer.style.display = 'none';
		bodyContainer.appendChild(this.createElement('span', 'Body'));
		var editorBodyContainer = document.createElement('div');
		bodyContainer.appendChild(editorBodyContainer);
		editorBodyContainer.classList.add('RestesterUI-editor-container');
		this.editorRequestBodyTextarea = document.createElement('textarea');
		if (this.data.body) {
			this.editorRequestBodyTextarea.value = this.data.body;
		}
		this.editorRequestBodyTextarea.name = 'body';
		editorBodyContainer.appendChild(this.editorRequestBodyTextarea);
		this.editorRequestBodyTextarea.classList.add('RestesterUI-editor');
		
		this.responseContainer = document.createElement('div');
		requestContainer.appendChild(this.responseContainer);
		this.responseContainer.classList.add('RestesterUI-widget');
		this.responseContainer.appendChild(this.createElement('b', 'Response'));
		this.responseContainer.setAttribute('data-tab', this.data.id);
		this.responseContainer.setAttribute('data-name', 'tab-Response');
		this.responseContainer.id = 'Response' + this.data.id;
		// this.responseContainer.style.display = 'none';
		
		var msgContainer = document.createElement('div');
		this.responseContainer.appendChild(msgContainer);
		this.messageContainer = document.createElement('div');
		this.messageContainer.style.display = 'none';
		msgContainer.appendChild(this.messageContainer);
		/*
			<div>
					<div id="RestesterUI-editor-error" class="RestesterUI-editor-error" style="display:none;"></div>
					<div id="RestesterUI-editor-valid" class="RestesterUI-editor-valid" style="display:none;"></div>
					<div id="RestesterUI-editor-inprogress" class="RestesterUI-editor-inprogress" style="display:none;"></div>							
				</div>
		*/
		var responseHeaderContainer = document.createElement('div');
		this.responseContainer.appendChild(responseHeaderContainer);
		responseHeaderContainer.classList.add('RestesterUI-container-action');
		responseHeaderContainer.appendChild(this.createElement('span', 'Headers'));
		
		var subresponseHeaderContainer = document.createElement('div');
		responseHeaderContainer.appendChild(subresponseHeaderContainer);
		subresponseHeaderContainer.classList.add('RestesterUI-editor-container');
		this.editorResponseHeadersTextarea = document.createElement('textarea');
		subresponseHeaderContainer.appendChild(this.editorResponseHeadersTextarea);
		this.editorResponseHeadersTextarea.classList.add('RestesterUI-editor');
		
		var responseBodyContainer = document.createElement('div');
		this.responseContainer.appendChild(responseBodyContainer);
		responseBodyContainer.classList.add('RestesterUI-container-action');
		responseBodyContainer.appendChild(this.createElement('span', 'Body'));

		var msgResponseContainer = document.createElement('div');
		responseBodyContainer.appendChild(msgResponseContainer);
		this.messageResponseContainer = document.createElement('div');
		this.messageResponseContainer.style.display = 'none';
		msgResponseContainer.appendChild(this.messageResponseContainer);
		/*
							<div id="editor-response-error" class="RestesterUI-editor-error" style="display:none;"></div>
		*/

		var subresponseBodyContainer = document.createElement('div');
		subresponseBodyContainer.setAttribute('data-name', 'response-body');
		responseBodyContainer.appendChild(subresponseBodyContainer);
		subresponseBodyContainer.classList.add('RestesterUI-editor-container');
		this.editorResponseBodyTextarea = document.createElement('textarea');
		subresponseBodyContainer.appendChild(this.editorResponseBodyTextarea);
		this.editorResponseBodyTextarea.classList.add('RestesterUI-editor');
	
		setTimeout(function () {
			self.initEditors();
			self.openTabber(null, 'tab-sub-menu-select', 'div[data-tab="'+self.data.id+'"]');
		}, 0);
	
		return this._container;
	}
	initEditors() {
		var self = this;
		this.codeMirrorRequestBody = CodeMirror.fromTextArea(this.editorRequestBodyTextarea, { mode:  "application/json", lineNumbers: true, viewportMargin: Infinity});
		this.codeMirrorRequestBody.setSize(null, 100);
		this.codeMirrorRequestBody.on("change", function () { setTimeout(function () { self.data.body = self.codeMirrorRequestBody.getValue("\n");}, 1); });
		this.codeMirrorResponseHeaders = CodeMirror.fromTextArea(this.editorResponseHeadersTextarea, { lineNumbers: true, viewportMargin: Infinity});
		this.codeMirrorResponseHeaders.setSize(null, 100);
		this.codeMirrorResponseBody = CodeMirror.fromTextArea(this.editorResponseBodyTextarea, { mode:  "application/json", lineNumbers: true, viewportMargin: Infinity});
		this.codeMirrorResponseBody.setSize(null, 200);
	}
}

/*class SOAPRequestStep extends RESTRequestStep {
	constructor(parent) {
		super(parent);
		this.myClass = SOAPRequestStep;
	}
}*/

class WidgetMenu extends Draggable {
	constructor(parent) {
		super(parent);
		this.class = 'RestesterUI-structure';
		this.text = '';
		return this;
	}
	mustBeRemoveFromParent() {
		return false;
	}
	removeWidget() {
		// n/a
	}
	dblclick(ev) {
		this.editor.template.addWidget(this, null);
	}
	createOrUpdateDOM() {
		super.createOrUpdateDOM();
		this.container.setAttribute('data-name', 'WidgetMenu-' + this._class);
		this.container.appendChild(document.createTextNode(this.text));
		return this.container;
	}
}

class AssertionMenu extends WidgetMenu {
	constructor(parent) {
		super(parent);
		this.myClass = AssertionMenu;
		Object.defineProperty(this, 'myClass', { enumerable: false });
		this.text = 'Assertion';
		return this;
	}
	getTarget() {
		return new AssertionStep(this);
	}
}

class ScriptMenu extends WidgetMenu {
	constructor(parent) {
		super(parent);
		this.myClass = ScriptMenu;
		Object.defineProperty(this, 'myClass', { enumerable: false });
		this.text = 'Script';
		return this;
	}
	getTarget() {
		return new ScriptStep(this);
	}
}


class ExtractionMenu extends WidgetMenu {
	constructor(parent) {
		super(parent);
		this.myClass = ExtractionMenu;
		Object.defineProperty(this, 'myClass', { enumerable: false });
		this.text = 'Extraction';
		return this;
	}
	getTarget() {
		return new ExtractionStep(this);
	}
}

class RESTRequestMenu extends WidgetMenu {
	constructor(parent) {
		super(parent);
		this.myClass = RESTRequestMenu;
		Object.defineProperty(this, 'myClass', { enumerable: false });
		this.text = 'REST Request';
		return this;
	}
	getTarget() {
		return new RESTRequestStep(this);
	}
}

/*class SOAPRequestMenu extends WidgetMenu {
	constructor(parent) {
		super(parent);
		this.myClass = SOAPRequestMenu;
		Object.defineProperty(this, 'myClass', { enumerable: false });
		this.text = 'SOAP Request';
		return this;
	}
	getTarget() {
		return new SOAPRequestStep(this);
	}
}*/


class ToolBox extends Container {
	constructor(parent) {
		super(parent);
		this.class = 'RestesterUI-toolbox';
		this.widgetArray = [];
		this.viewContainer = null;
		this.properties = null;
		this.propertiesButton = null;
		return this;
	}
	addWidget(widget) {
		this.widgetArray.push(widget);
	}
	createOrUpdateDOM() {
		var self = this;
		super.createOrUpdateDOM();

		var menuContainer = document.createElement('div');
		menuContainer.classList.add('RestesterUI-bar');
		menuContainer.classList.add('RestesterUI-lgray');		
		var button = document.createElement('button');
		button.id="button-toolbox-widget";
		button.classList.add('RestesterUI-toolbox-button');
		button.classList.add('RestesterUI-toolbox-button-select');
		button.appendChild(document.createTextNode('Steps'));
		menuContainer.appendChild(button);

		this.container.appendChild(menuContainer);
		
		this.viewContainer = document.createElement('div');
		this.viewContainer.classList.add('RestesterUI-toolbox-content');
		this.container.appendChild(this.viewContainer);
		this.viewContainer.appendChild(document.createTextNode('Drag and drop or double-click in order to add a new step.'));
		this.viewContainer.appendChild(document.createElement('br'));
		this.viewContainer.appendChild(document.createElement('br'));
		var container = new Container(this);
		this.viewContainer.appendChild(container.container);
		container.container.classList.add('RestesterUI-tabber');
		container.container.id = "toolbox-content";
		var boxContainer = new Container(this);
		container.container.appendChild(boxContainer.container);
		boxContainer.container.classList.add('RestesterUI-toolbox-content-content');
		this.widgetArray.forEach(function(content) {
			boxContainer.container.appendChild(content.createOrUpdateDOM());
		});
	
		return this.container;
	}
}

class Template extends DropZoneContainer {
	constructor(parent, data) {
		super(parent);
		this.class = ['RestesterUI-template'];
		this._authorizedClassArray = [];
		Object.defineProperty(this, '_authorizedClassArray', { enumerable: false });
		this._dropZoneJunction = DropZoneJunction;
		Object.defineProperty(this, '_dropZoneJunction', { enumerable: false });
		this.buttonRun = null;
		Object.defineProperty(this, 'buttonRun', { enumerable: false });
		this.buttonSave = null;
		Object.defineProperty(this, 'buttonSave', { enumerable: false });
		this.resultContainer = null;
		Object.defineProperty(this, 'resultContainer', { enumerable: false });
		this.results = null;
		this.styles = {};
		if (!data) {
			data = {};
		}
		this.data = data;
		if (!this.data.id) {
			this.data.id = this.id;
		}
		if (!this.data.name) {
			this.data.name = 'New test';
		}
		
		return this;
	}
	getDataOfCurrentTest() {
		return JSON.parse(JSON.stringify(this, function (key, value) {
				if (key == "_parent") {
					return undefined;
				} else if (value instanceof HTMLElement) {
					return undefined;
				} else if (key !== '' && value instanceof Editor) {
					return undefined;
				}
				return value;
		}));
	}
	getInlineStyle(key, styleAttribute = false) {
		var self = this;
		if (Array.isArray(key)) {
			var result = '';
			key.forEach(function(k) {
				result += self.getInlineStyle(k, false);
			});
			return (styleAttribute ? ' style="' : '') + result + (styleAttribute ? '"' : '');
		}
		if (this.styles[key]) {
			return (styleAttribute ? ' style="' : '') + this.styles[key].reduce(function (accumulator, currentValue) { accumulator += currentValue; return accumulator;}, '') + (styleAttribute ? '"' : '');
		}
		return '';
	}
	wrap(target) {
		return target;
	}
	deleteMenu(structure) {
		this.removeWidget(structure, true);
	}
	copyMenu(structure) {
		var clone = structure.clone();
		this.addWidget(clone, structure, true);
	}
	generate(options) {
		var result = {html:"", imgArray:""};
		return result;
	}
	displayRunResult() {
		var self = this;
		var span = null;
		var recapResult = 0;
		this.results.forEach(function (result, index) {
			var c = document.createElement('div');
			c.setAttribute('data-name', 'Result-Step-'+(index+1));
			self.resultContainer.appendChild(c);
			c.classList.add('RestesterUI-widget-result');
			var step = document.createElement('div');
			c.appendChild(step);
			step.classList.add('RestesterUI-widget-result-step');
			step.appendChild(document.createTextNode('Step '+(index+1)));
			if (result.status == 0) {
				span = document.createElement('span');
				span.classList.add('RestesterUI-step-ok');
				span.innerHTML = '\u2713';
				c.appendChild(span);
			} else {
				recapResult = result.status;
				span = document.createElement('span');
				span.classList.add('RestesterUI-step-ko');
				span.innerHTML = '\u2a2f';
				c.appendChild(span);
			}
			
			if (typeof result.message === 'object') {
				c.appendChild(result.message);
			} else {
				span = document.createElement('span');
				span.innerHTML = result.message;
				c.appendChild(span);
			}
		});
		var recap = document.createElement('div');
		if (recapResult == 0) {
			span = document.createElement('span');
			span.setAttribute('data-name', 'resultall');
			span.classList.add('RestesterUI-stepall-ok');
			span.innerHTML = '\u2713 Success';
			recap.appendChild(span);
		} else {
			span = document.createElement('span');
			span.setAttribute('data-name', 'resultall');
			span.classList.add('RestesterUI-stepall-ko');
			span.innerHTML = '\u2a2f Failed';
			recap.appendChild(span);
		}
		this.resultContainer.insertBefore(recap, this.resultContainer.firstChild);
	}
	run() {
		var self = this;
		this.resultContainer.style.display = '';
		this.results = [];
		while (this.resultContainer.firstChild) this.resultContainer.removeChild(this.resultContainer.firstChild);
		var widgets = this.widgets.slice(0).filter(function (w) { return w instanceof WidgetStep; });
		var iterateWidget = function(previousResult) {
			if (previousResult) {
				self.results.push(previousResult);
				if (previousResult.status == 1) {
					return self.displayRunResult();
				}
			}
			if (widgets.length){
				var w = widgets.shift();
				w.run(iterateWidget);
			} else {
				return self.displayRunResult();
			}
		}
		iterateWidget(null);
	}
	changeName() {
		this.data.name = this.inputName.value;
		this.editor.fire('Template.changeName', this.data);
	}
	createOrUpdateDOM() {
		var self = this;
		super.createOrUpdateDOM();

		var containerName = document.createElement('div');
		containerName.classList.add('RestesterUI-name');
		// containerName.appendChild(document.createTextNode('Test name'));
		this.inputName = this.createInput({type : "text", name: "name",  value: this.data.name, onchange: this.changeName.bind(this), onkeyup: this.changeName.bind(this)});
		containerName.appendChild(this.inputName);
		if (!this.buttonSave) {
			this.buttonSave = this.createInput({type : "button", name: "Save",  value: "Save test", className: 'RestesterUI-button-action', onclick: this.editor.saveCurrent.bind(this.editor)});
		}
		containerName.appendChild(this.buttonSave);
		/*if (!this.buttonReset) {
			this.buttonReset = this.createInput({type : "button", name: "Reset",  value: "Reset test", className: 'RestesterUI-button-action', onclick: this.editor.reset.bind(this.editor)});
		}
		containerName.appendChild(this.buttonReset);*/
		
		this.container.insertBefore(containerName, this.container.firstChild);
		if (!this.buttonRun) {
			this.buttonRun = this.createInput({type : "button", name: "Run",  value: "Run test", className: 'RestesterUI-button-run', onclick: this.run.bind(this)});
		}
		this.container.appendChild(this.buttonRun);
			
		/*if (!this.buttonLoad) {
			this.buttonLoad = this.createInput({type : "button", name: "Load",  value: "Load test", className: 'RestesterUI-button-run', onclick: this.editor.load.bind(this.editor)});
		}
		this.container.appendChild(this.buttonLoad);*/
		if (!this.resultContainer) {
			this.resultContainer = document.createElement('div');
			this.resultContainer.classList.add('RestesterUI-result');
			this.resultContainer.style.display = 'none';
		}
		this.container.appendChild(this.resultContainer);
		return this.container;
	}
}

class Editor extends Container {
	constructor() {
		super(null);
		this.class = 'RestesterUI';
		this.current = [];
		this._currentElement = null;
		this._currentEdit = null;
		this._dragObject = null;
		this.widgetArray = [];
		this.toolBox = null;
		this.template = null;
		this.favorites = {tests: []};
		editors.push(this);
		
		this.requestsTabs = null;
		Object.defineProperty(this, 'requestsTabs', { enumerable: false });
		this.requestsContainer = null;
		Object.defineProperty(this, 'requestsContainer', { enumerable: false });
		
		this.openedTests = [];
		Object.defineProperty(this, 'openedTests', { enumerable: false });
		
		this._favoritesContainer = null;
		Object.defineProperty(this, '_favoritesContainer', { enumerable: false });
		
		this._favoritesSubContainer = null;
		Object.defineProperty(this, '_favoritesSubContainer', { enumerable: false });
		
		return this;
	}
	get favoritesContainer() {
		if (!this._favoritesContainer) {
			this.createOrUpdateDOM();
		}
		return this._favoritesContainer;
	}
	get favoritesSubContainer() {
		if (!this._favoritesSubContainer) {
			this.createOrUpdateDOM();
		}
		return this._favoritesSubContainer;
	}
	get editor() {
		return this;
	}
	get dragObject() {
		return this._dragObject;
	}
	set dragObject(obj) {
		this._dragObject = obj;
	}
	disableCurrentEdit() {
		if (this._currentEdit) {
			this._currentEdit.disableEdit();
		}
	}
	setCurrentEdit(edit) {
		if (this._currentEdit != edit) {
			this.disableCurrentEdit();
			this._currentEdit = edit;
		}
	}
	getCurrentElement() {
		return this._currentElement;
	}
	setCurrentElement(widget) {
		if (this._currentElement != widget) {
			if(this._currentElement) {
				this._currentElement.desactivate();
			}
			this._currentElement = widget;
			widget.activate();
			this.disableCurrentEdit();
		}
	}
	addWidget(widget) {
		this.toolBox.addWidget(widget);
		this.template.authorizedClass.push(widget.myClass);
		this.template.authorizedClass.push(widget.getTarget().myClass);
	}
	init() {
		this.toolBox = new ToolBox(this);
		this.template = new Template(this);
	}
	reset() {
		this.template = new Template(this);
		this.template.createOrUpdateDOM();
		this.createOrUpdateDOM();
	}
	saveCurrent() {
		var self = this;
		if (!this.template.data.name || this.template.data.name == '') {
			alert('You must fill name field');
			return;
		}
		var data = this.template.getDataOfCurrentTest();
		if (!this.favorites.tests.some(function (favorite, index) {
			if (favorite.data.id == self.template.data.id) {
				self.favorites.tests.splice(index, 1, data);
				return true;
			}
		})) {
			this.favorites.tests.push(data);
		}
		this.saveAll(function() {
			self.listFavorites();
			alert('Your test has been saved');
		});
	}
	saveAll(callback) {
		var self = this;
		localStorage.setItem('RestesterUI.favorites', JSON.stringify(this.favorites));
		if (callback) callback();
	}
	fire(eventName, data) {
		if (eventName == 'Template.changeName') {
			var elt = this.requestsTabs.querySelector('div[id="button-' + data.id + '"] span');
			if (elt) {
				elt.removeChild(elt.firstChild);
				elt.insertBefore(document.createTextNode(data.name), elt.firstChild);
			}
		}
		this.widgets.forEach(function (w) {
			if (!(w instanceof Editor)) {
				w.fire(eventName, data);
			}
		});
	}
	getCurrent(key) {
		if (!this.current[key]) {
			return null;
		}
		return this.current[key];
	}
	setCurrent(key, obj) {
		this.current[key] = obj;
		return obj;
	}
	referenceWidget(widget) {
		if (!this.widgetArray) {
			this.widgetArray = [];
		}
		if (this.widgetArray.indexOf(widget) === -1) {
			this.widgetArray.push(widget);
			return true;
		}
		return false;
	}
	get widgets() {
		return this.widgetArray;
	}
	getWidget(id) {
		var widget = null;
		this.widgetArray.some(function(w) {
			if (id == w.id) {
				widget = w;
				return true;
			}
			return false;
		});
		return widget;
	}
	createOrUpdateDOM() {
		super.createOrUpdateDOM();
		
		this._favoritesContainer = document.createElement('div');
		this.toolBox.container.insertBefore(this._favoritesContainer, this.toolBox.container.firstChild);
		
		this._favoritesContainer.classList.add('RestesterUI-tools-box');
		var buttonShare = document.createElement('button');
		buttonShare.id="button-toolbox-widget";
		buttonShare.classList.add('RestesterUI-toolbox-button');
		buttonShare.classList.add('RestesterUI-toolbox-button-select');
		buttonShare.classList.add('RestesterUI-tools-box-title');
		buttonShare.appendChild(document.createTextNode('Your favorite test cases'));
		this._favoritesContainer.appendChild(buttonShare);

		this._favoritesSubContainer = document.createElement('div');
		this._favoritesSubContainer.classList.add('RestesterUI-tools-box-content');
		this._favoritesContainer.appendChild(this._favoritesSubContainer);

		this.container.appendChild(this.toolBox.container);
		var templateContainer = document.createElement('div');
		templateContainer.classList.add('RestesterUI-template-container');
		
		this.requestsContainer = document.createElement('div');
		templateContainer.appendChild(this.requestsContainer);
		this.requestsContainer.classList.add('RestesterUI-bar');
		
		this.requestsTabs = document.createElement('div');
		this.requestsContainer.appendChild(this.requestsTabs);
		this.requestsTabs.classList.add('RestesterUI-request-tabs');
		
		var buttonAdd = document.createElement('button');
		this.requestsContainer.appendChild(buttonAdd);
		buttonAdd.appendChild(document.createTextNode('\u002B')); 
		buttonAdd.classList.add('RestesterUI-request-add-button');
		buttonAdd.onclick = this.addTest.bind(this);
		
		templateContainer.appendChild(this.template.container);
		this.container.appendChild(templateContainer);
		
		return this.container;
	}	
	addTest() {
		var test = {};
		test._class = 'Template';
		test.data = {};
		test.data.id = String(new Date().getTime()) + Math.floor(Math.random() * 1000000);
		if (typeof(md5) !== "undefined") {
			test.data.id = md5(test.data.id);
		}
		test.data.name = 'New Test';
		test.widgetArray = [];		
		test.widgetArray.push({_class: 'DropZoneJunction'});
		test.widgetArray.push({_class: 'RESTRequestStep'});
		test.widgetArray.push({_class: 'DropZoneJunction'});
		this.openTest(test);
	}
	saveCurrentTestInMemery() {
		var elt = this.requestsTabs.querySelector('div[class*="RestesterUI-gray"]');
		if (elt) {
			var data = this.template.getDataOfCurrentTest();
			var currentTest = this.getOpenedTest(elt.getAttribute('data-test-id'));
			if (currentTest) {
				Object.keys(data).forEach(function(property) {
					currentTest[property] = data[property];
				});
			}
		}
	}
	openTest(test) {
		this.saveCurrentTestInMemery();
		var elt = this.requestsTabs.querySelector('div[id="button-' + test.data.id + '"]');
		if (!elt) {
			this.addTabForTest(test);
		}
		this.selectTabber(test);
		this.template.loadFromJson(test);
		this.template.createOrUpdateDOM();
	}
	getOpenedTest(id) {
		var value = this.openedTests.filter(function (currentValue) {
			return currentValue.data.id === id;
		});
		if (value.length) {
			return value[0];
		}
		return null;
	}
	closeTest(test) {
		if (this.openedTests.indexOf(test) !== -1) {
			this.openedTests.splice(this.openedTests.indexOf(test), 1);
		}
		var elt = this.requestsTabs.querySelector('div[id="button-' + test.data.id + '"]');
		if (!elt) {
			return;
		}
		if (elt.classList.contains('RestesterUI-gray')) {
			var testToOpen = null;
			if (elt.previousSibling) {
				testToOpen = this.getOpenedTest(elt.previousSibling.getAttribute('data-test-id'));
				if (testToOpen) {
					this.openTest(testToOpen);
				}
			} else if (elt.nextSibling) {
				testToOpen = this.getOpenedTest(elt.nextSibling.getAttribute('data-test-id'));
				if (testToOpen) {
					this.openTest(testToOpen);
				}
			} else {
				this.addTest();
			}
		}
		elt.parentNode.removeChild(elt);
	}
	selectTabber(test) {
		var elt = this.requestsTabs.querySelector('div[id="button-' + test.data.id + '"]');
		if (elt) {
			if (elt.classList.contains('RestesterUI-gray')) {
				return;
			}
		}
		var elts = this.requestsTabs.querySelectorAll('div[id*="button-"]');
		for (var i = 0; i < elts.length; i++) {
			elts[i].classList.remove('RestesterUI-gray');
		}
		if (elt) {
			elt.classList.add('RestesterUI-gray');
		}
	}
	addTabForTest(test) {
		var self = this;
		var containerTab = document.createElement('div');
		containerTab.classList.add('RestesterUI-tabber-button');
		containerTab.classList.add('RestesterUI-span');
		containerTab.id = 'button-' + test.data.id;
		containerTab.setAttribute('data-test-id', test.data.id);
		containerTab.classList.add('RestesterUI-item');
		containerTab.classList.add('RestesterUI-button');
		// containerTab.classList.add('RestesterUI-gray');
		this.requestsTabs.appendChild(containerTab);
		var spanTab = document.createElement('span');
		containerTab.appendChild(spanTab);
		spanTab.appendChild(document.createTextNode(test.data.name));
		spanTab.onclick = function (ev) {
			self.openTest(test);
			ev.stopPropagation();
		}
		var buttonClose = document.createElement('button');
		buttonClose.innerHTML = "&#x2a2f";
		buttonClose.onclick = function (ev) {
			self.closeTest(test);
			ev.stopPropagation();
		};
		buttonClose.classList.add('RestesterUI-cross');
		spanTab.appendChild(buttonClose);
		
		this.openedTests.push(test);
	}
	listFavorites() {
		var self = this;
		while (this.favoritesSubContainer && this.favoritesSubContainer.firstChild) this.favoritesSubContainer.removeChild(this.favoritesSubContainer.firstChild);
		this.favorites.tests.forEach(function(favorite) {
			var ahref = document.createElement('a');
			ahref.classList.add('RestesterUI-link-action');
			ahref.text = favorite.data.name;
			var containerFavorite = document.createElement('div');
			containerFavorite.classList.add('RestesterUI-favorite-container');
			self.favoritesSubContainer.appendChild(containerFavorite);
			var request = null;
			ahref.classList.add('RestesterUI-favorite-name');
			ahref.setAttribute('data-name', 'view-request-' + favorite.data.name);
			ahref.onclick = function() {
				self.openTest(favorite);
			};
			containerFavorite.appendChild(ahref);

			var imgDelete = document.createElement('img');
			imgDelete.setAttribute('data-name', 'remove-request-' + favorite.data.name);
			imgDelete.src = './image/error.png';
			imgDelete.onclick = function () {
				if (confirm('Do you want to delete this test?')) {
					if (self.favorites.tests.indexOf(favorite) !== -1) {
						 self.favorites.tests.splice(self.favorites.tests.indexOf(favorite), 1);
					}
					self.closeTest(favorite);
					self.saveAll(function () {
						self.listFavorites();
						alert('Your test has been removed');
					});
				}
			};
			imgDelete.classList.add('RestesterUI-link-action');
			imgDelete.classList.add('RestesterUI-logo-click');
			imgDelete.classList.add('RestesterUI-right');
			containerFavorite.appendChild(imgDelete);
		});	
		
		if (!this.editor.favorites.tests.length) {
			self.favoritesSubContainer.appendChild(document.createTextNode('You do not have favorite test cases.'));			
		}
		self.favoritesSubContainer.appendChild(document.createElement('br'));
		self.favoritesSubContainer.appendChild(document.createTextNode('Warning, the backup of favorites is local in your browser, it can be deleted at any time.'));
		self.favoritesSubContainer.appendChild(document.createElement('br'));		
	}
	loadFavorites() {
		this.favorites = JSON.parse(localStorage.getItem('RestesterUI.favorites'));
		if (!this.favorites) {
			this.favorites = {};
		}
		if (!this.favorites.tests) {
			this.favorites.tests = [];
		}
	}
}
document.addEventListener("dragenter", function( event ) {
	editors.forEach(function (editor) {
		const widget = editor.getWidget(event.target.id);
		if (widget && widget.dragEnter) {
			widget.dragEnter(event);
		}
	});
}, false);
document.addEventListener("dragleave", function( event ) {
	editors.forEach(function (editor) {
		const widget = editor.getWidget(event.target.id);
		if (widget && widget.dragLeave) {
		  widget.dragLeave(event);
		}
	});
}, false);
