"use strict";

const { Builder, By, Key, until } = require('selenium-webdriver');
const { expect } = require('chai');
const config = require('./config.js').config;
const fs = require('fs');

describe('RestesterUI', () => {
    const driver = new Builder().forBrowser('chrome').build();
    it('should go to RestesterUI page', async () => {
		await driver.get(config.dir + '/index.html');
		await driver.sleep(500);
    });
	async function fillRequest(request) {
		var container = (await driver.findElements(By.css('div[data-name="rest-client-request"]')))[request.position];
		await driver.executeScript("arguments[0].scrollIntoView(true);", container);
		await container.findElement(By.name('name')).clear();
		if (request.name) await container.findElement(By.name('name')).sendKeys(request.name);
		await container.findElement(By.css('select[name="method"]')).click();
		if (request.method) await container.findElement(By.css('select[name="method"] option[value="'+request.method+'"]')).click();
		if (request.url) await container.findElement(By.name('url')).sendKeys(request.url);
		var authentificationTab = container.findElement(By.css('div[data-name="menu-Authentication"]'));
		await driver.executeScript("arguments[0].scrollIntoView(true);", authentificationTab);
		await authentificationTab.click();
		await driver.sleep(500);
		if (request.username) await container.findElement(By.name('username')).sendKeys(request.username);
		if (request.password) await container.findElement(By.name('password')).sendKeys(request.password);
		await container.findElement(By.css('div[data-name="menu-Body"]')).click();
		var codeMirrorBody = await container.findElement(By.css('div[data-name="tab-Body"] div.CodeMirror'));
		await driver.executeScript("arguments[0].CodeMirror.setValue(\""+request.body+"\");", codeMirrorBody);
		await container.findElement(By.css('div[data-name="menu-Headers"]')).click();
		var headerDeleteArray = await container.findElements(By.css('input[name="deleteHeader"]'));
		for(var i = 0; i < headerDeleteArray.length; i++) {
			await headerDeleteArray[i].click();
		}
		if (request.headers) {
			for(var i = 0; i < request.headers.length; i++) {
				await container.findElement(By.name('headerName')).sendKeys(request.headers[i].name);
				await container.findElement(By.name('headerValue')).sendKeys(request.headers[i].value);
				var headerAddButton = await container.findElement(By.css('input[type="button"][name="AddHeader"]'));
				await driver.executeScript("arguments[0].scrollIntoView(true);", headerAddButton);
				await headerAddButton.click();			
			}
		}
	}
	async function fillExtract(request) {
		var container = (await driver.findElements(By.css('div[data-name="extraction"]')))[request.position];
		await driver.executeScript("arguments[0].scrollIntoView(true);", container);
		await container.findElement(By.name('name')).clear();
		if (request.name) await container.findElement(By.name('name')).sendKeys(request.name);
		if (request.origin) await container.findElement(By.css('select[name="origin"] option[value="'+request.origin+'"]')).click();
		if (request.subParam) await container.findElement(By.name('subParam')).sendKeys(request.subParam);
		if (request.method) await container.findElement(By.css('select[name="method"] option[value="'+request.method+'"]')).click();
		if (request.value) await container.findElement(By.name('value')).sendKeys(request.value);
	}
	async function fillScript(request) {
		var container = (await driver.findElements(By.css('div[data-name="script"]')))[request.position];
		await driver.executeScript("arguments[0].scrollIntoView(true);", container);
		await container.findElement(By.name('name')).clear();
		if (request.name) await container.findElement(By.name('name')).sendKeys(request.name);
		if (request.script) {
			var codeMirror = await container.findElement(By.css('div.CodeMirror'));
			await driver.executeScript("arguments[0].CodeMirror.setValue(\""+request.script+"\");", codeMirror);
		}
	}
	async function fillAssertion(request) {
		var container = (await driver.findElements(By.css('div[data-name="assertion"]')))[request.position];
		await driver.executeScript("arguments[0].scrollIntoView(true);", container);
		await container.findElement(By.name('name')).clear();
		if (request.name) await container.findElement(By.name('name')).sendKeys(request.name);
		if (request.param) await container.findElement(By.xpath('//select[@name="param"]/option[contains(text(), "'+request.param+'")]')).click();
		if (request.subParam) await container.findElement(By.name('subParam')).sendKeys(request.subParam);
		if (request.operator) await container.findElement(By.css('select[name="operator"] option[value="'+request.operator+'"]')).click();
		if (request.value) await container.findElement(By.name('value')).sendKeys(request.value);
	}
    it('should update request', async () => {
		await driver.findElement(By.name('name')).clear();
		await driver.findElement(By.name('name')).sendKeys('Unittest');
		await driver.sleep(500);
		await fillRequest({
			position:0,
			name: 'unittest1',
			method: 'POST',
			url: 'https://extendsclass.com/test-web-service',
			username: 'unittest',
			password: 'pwd',
			body: 'test',
			headers: [{name: 'Unittest', value: 'xml'}]
		});
    });
	it('should extract val from xml', async () => {
		const actions = driver.actions({bridge: true});
		var menu = driver.findElement(By.css('div[data-name="WidgetMenu-ExtractionMenu"]'));
		await driver.executeScript("arguments[0].scrollIntoView(true);", menu);
		await driver.sleep(100);
		await actions.doubleClick(menu).perform();
		await driver.sleep(100);
		await fillExtract({
			position:0,
			name: 'val',
			origin: 'body',
			method: 'xpath',
			subParam: null,
			value: '//val/text()'
		});
    });
	it('should add a request', async () => {
		const actions = driver.actions({bridge: true});
		var menu = driver.findElement(By.css('div[data-name="WidgetMenu-RESTRequestMenu"]'));
		await driver.executeScript("arguments[0].scrollIntoView(true);", menu);
		await driver.sleep(100);
		await actions.doubleClick(menu).perform();
		await driver.sleep(100);
		await fillRequest({
			position:1,
			name: 'unittest1',
			method: 'POST',
			url: 'https://extendsclass.com/test-web-service',
			username: 'unittest',
			password: 'pwd',
			body: 'test',
			headers: [{name: 'Unittest', value: 'json'}]
		});
    });
	it('should extract val from json', async () => {
		const actions = driver.actions({bridge: true});
		var menu = driver.findElement(By.css('div[data-name="WidgetMenu-ExtractionMenu"]'));
		await driver.executeScript("arguments[0].scrollIntoView(true);", menu);
		await driver.sleep(100);
		await actions.doubleClick(menu).perform();
		await driver.sleep(100);
		await fillExtract({
			position:1,
			name: 'val2',
			origin: 'body',
			method: 'jsonpath',
			subParam: null,
			value: '$..val2'
		});
    });
	it('should add a script', async () => {
		const actions = driver.actions({bridge: true});
		var menu = driver.findElement(By.css('div[data-name="WidgetMenu-ScriptMenu"]'));
		await driver.executeScript("arguments[0].scrollIntoView(true);", menu);
		await driver.sleep(100);
		await actions.doubleClick(menu).perform();
		await driver.sleep(100);
		await fillScript({
			position:0,
			name: 'val_plus_val2',
			script: 'return parseInt(val) + parseInt(val2);'
		});
    });
	it('should add a assertion', async () => {
		const actions = driver.actions({bridge: true});
		var menu = driver.findElement(By.css('div[data-name="WidgetMenu-AssertionMenu"]'));
		await driver.executeScript("arguments[0].scrollIntoView(true);", menu);
		await driver.sleep(100);
		await actions.doubleClick(menu).perform();
		await driver.sleep(100);
		await fillAssertion({
			position:0,
			name: 'check val_plus_val2',
			param: 'val_plus_val2',
			subParam: null,
			operator: '=number',
			value: '110'
		});
    });
	it('should save', async () => {
		await driver.findElement(By.name('Save')).click();
		await driver.sleep(500);
		await driver.switchTo().alert().accept();
	});
    it('should open test case', async () => {
		await driver.get(config.dir + '/index.html');
		await driver.sleep(500);		
		var menu = driver.findElement(By.css('a[data-name="view-request-Unittest"]'));
		await driver.executeScript("arguments[0].scrollIntoView(true);", menu);
		await menu.click();
		await driver.sleep(500);
	});
	it('should test', async () => {
		await driver.findElement(By.css('input[name="Run"]')).click();
		await driver.sleep(500);
		var response = await (await driver.findElement(By.css('span[data-name="resultall"]')).getAttribute('innerHTML'));
		await driver.sleep(500);
		
		expect(response).to.have.string('Success');
		response = await (await driver.findElement(By.css('div[data-name="Result-Step-5"]')).getAttribute('innerHTML'));
		expect(response).to.have.string('Set <b>val_plus_val2</b> = 110');
    });
    it('should remove test case', async () => {
		var menu = driver.findElement(By.css('img[data-name="remove-request-Unittest"]'));
		await driver.executeScript("arguments[0].scrollIntoView(true);", menu);
		await menu.click();
		await driver.sleep(500);
		await driver.switchTo().alert().accept();
		await driver.sleep(500);
		await driver.switchTo().alert().accept();
	});
    after(async () => driver.quit());
});