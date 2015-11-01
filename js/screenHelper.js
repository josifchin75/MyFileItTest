/***********************
File: 			screenHelperjs
Date: 			01Nov2015
Created: 		J Osifchin
Description: 	control to handle changing pages and transitions
***************************/
var contentDivName = "main-content";
var headerDivName = "header";
var screenBasePath = "screens/";
var screenExtensionType = ".html";


var screenHelper = {
    initialize: function() {
    },
    buttonHandler: function(obj){
        var nextScreen = $(obj).attr('next-screen');
        var title = $(obj).attr('next-screen-title');
        var contentDiv = $(obj).attr('next-screen-content-div');

        screenHelper.changeScreen(nextScreen, title, contentDiv, null)
    },
    changeScreen: function(screenName, title, contentDivOverloadObject, callback){
    	var url = this.getScreenUrl(screenName);
        var contentDiv;
        if(typeof contentDivOverloadObject == "object" && contentDivOverloadObject != null){
            contentDiv = $(contentDivOverloadObject);
        } else {
            contentDiv = $('#' + contentDivName);    
        }

        if(title != null){
           $('#' + headerDivName).html("");
        }
        $(contentDiv).html('<img class="loading" src="res/img/spinner.gif"/>Loading...');

        $(contentDiv).load(
            url, 
            null, 
            function (e) {
                if(typeof callback == "function"){
                    callback();
                }
                if(title != null){
                   $('#' + headerDivName).html(title);
                }

                $(contentDiv).find('.nav-button').each( function() {
                    $(this).bind(
                        'click',
                        function() { 
                            screenHelper.buttonHandler(this);
                        }
                    );
                });
                $(contentDiv).find('.numeric-pad').each( function () {
                    if($(this).html().length == 0){
                        screenHelper.renderNumericPad($(this));
                    }
                });
            }
        ).hide().fadeIn('fast');
        
    },
    getScreenUrl: function(screenName){
    	return screenBasePath + screenName + screenExtensionType;
    }
};