let container = document.querySelector('.main-content');
//load data
let loadData = function(){
	var request = new XMLHttpRequest();
	request.open('GET', 'recipes.json', true);
	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    // Success!
	    var data = JSON.parse(request.responseText);
	    return displayOnLandingPage(data);
	  } else {
	    // We reached our target server, but it returned an error
	    console.log("error!");

	  }
	};
	request.onerror = function() {
	  // There was a connection error of some sort
	  console.log("connection error!");
	};

	request.send();
}

//create global to pass around data - is there a better way?
let dessertsArr;
//display recipe titles on landing page
let displayOnLandingPage = function(data){
	dessertsArr = data;
	for(let i = 0; i < dessertsArr.length; i++){
		createLandingPageElements(i, dessertsArr);
	}

	enableEvents();

}


//LANDING VIEW---
let createLandingPageElements = function(index, dessertsArr){
	let contentDiv = document.querySelector('.landing-content');
	let dessertUrl = dessertsArr[index].url;


	let containerStart = document.createElement("hr");
	containerStart.classList.add("container-segments");
	contentDiv.appendChild(containerStart);

	let linkItem = document.createElement("a");
	contentDiv.appendChild(linkItem);

	let dessertEntry = document.createElement("div");
	dessertEntry.textContent = dessertsArr[index].title;
	dessertEntry.setAttribute("data-name", dessertUrl);
	dessertEntry.setAttribute("tabindex", 2);
	dessertEntry.id = index;
	dessertEntry.classList.add("dessert-item");
	dessertEntry.style.marginBottom = "20px";
	dessertEntry.style.fontSize = "20px";
	linkItem.appendChild(dessertEntry);

}

//Events to switch between the views
function enableEvents(){
	let landingLinkArea = document.querySelector('.landing-content');
	landingLinkArea.addEventListener("click", function(evt){
		if(evt.target.classList[0] === "dessert-item") {
			routeRecipe(evt)
		}
	}, false);
	landingLinkArea.addEventListener("touchstart", function(evt){

		if(evt.target.classList[0] === "dessert-item") {
			routeRecipe(evt)
		}
	}, false);
	landingLinkArea.addEventListener("keyup", function(evt){
		if(evt.which == 13){
			if(evt.target.classList[0] === "dessert-item") {
				routeRecipe(evt)
			}
		}
	}, false);

	let headerArea = document.querySelector("header");
	headerArea.addEventListener("click", function(evt){
		return loadLanding();
	}, false)
	headerArea.addEventListener("touchstart", function(evt){
		return loadLanding();
	}, false)

	headerArea.addEventListener("keyup", function(evt){
		if(evt.which == 13){
			return loadLanding();
		}
	}, false);

	window.addEventListener("popstate", function(){
			return loadLanding();
	}) 

}

function loadLanding(){
	let templateTitle = "landingTpl";

	let stateObj = {
		recipe: loadLandingTemplate(templateTitle, dessertsArr)
	}
	history.pushState(stateObj, "", "dessertsMVC-JS");	

}

//RECIPE VIEW---
function loadRecipePage(evt){
	let title = evt.target.innerHTML;
	let index = evt.target.id;
	let templateTitle = "recipeTpl";
	let currentData = dessertsArr[index];

	loadRecipeTemplate(templateTitle, index, dessertsArr);

	populateRecipePage(currentData, title);
}

function populateRecipePage(data, title){
	let recipeTitle = document.querySelector(".recipe-title");
	recipeTitle.textContent = title;

	//add serving size
	let servingSize = document.querySelector(".servings");
	servingSize.textContent = "Makes about " + data.servings;

	//create parent container element for ingredients
	let ingredientList = document.querySelector(".ingredients");
	let ingredientContainer = document.createElement("div");
	ingredientContainer.classList.add("ingredient-container");
	ingredientList.appendChild(ingredientContainer);
	//add ingredients
	for(let i = 0; i < data.ingredients.length; i++){
		populateIngredientList(data.ingredients[i], ingredientContainer);
	}

	//add recipe steps
	populateRecipeSteps(data);
}

function populateIngredientList(data, ingredientContainer){
	let ingredientEntry = document.createElement("div");
	let possiblePluralArr = ["ounce", "cup"];

	let quantity = data.quantity;
	let unit = data.unit;
	let item = data.item;

	//add plural, if necessary
	if(quantity > 1){
		if(possiblePluralArr.includes(unit)){
			unit += "s";
		}
	}

	//evaluate and concatenate fractions
	if(quantity % 1 > 0){
		let remainderFrac = quantity % 1;
		let frac, aboveOne;
		if(remainderFrac === 0.25){
			frac = "¼";
			quantity > 1 ? aboveOne = true : aboveOne = false;
			quantity = evaluateIngredientFractions(frac, remainderFrac, aboveOne, quantity);
		} else if (remainderFrac === 0.33){
			frac = "⅓";
			quantity > 1 ? aboveOne = true : aboveOne = false;
			quantity = evaluateIngredientFractions(frac, remainderFrac, aboveOne, quantity);
		} else if (remainderFrac === 0.5){
			frac = "½";
			quantity > 1 ? aboveOne = true : aboveOne = false;
			quantity = evaluateIngredientFractions(frac, remainderFrac, aboveOne, quantity);
		} else if (remainderFrac === 0.75){
			frac = "¾";
			quantity > 1 ? aboveOne = true : aboveOne = false;
			quantity = evaluateIngredientFractions(frac, remainderFrac, aboveOne, quantity);
		}
	}

	//replace non-units with an empty string
	if(unit == "NA"){
		unit = "";
	}

	//this is the value to be displayed on the scrren
	let finalProduct = quantity + " " + unit + " " + item;
	ingredientEntry.textContent = finalProduct;
	//append entry to the DOM
	ingredientContainer.appendChild(ingredientEntry);

}

//return fractions with or without whole numbers depending on their quantity
function evaluateIngredientFractions(frac, remainderFrac, aboveOne, quantity){

	if(aboveOne === true){
		return quantity - remainderFrac + frac;
	} else {
		return frac;
	}

}

function populateRecipeSteps(data){
	let recipeSteps = document.querySelector(".steps");
	let recipeContainer = document.createElement("div");
	recipeContainer.classList.add("recipe-container");
	recipeSteps.appendChild(recipeContainer);

	let stepsArr = data.steps;

	for(let i = 0; i < stepsArr.length; i++){
		let order = stepsArr[i].order;
		let instruction = stepsArr[i].instruction;

		let finalStep = order + ". " + instruction;

		let recipeStepEntry = document.createElement("div");
		recipeStepEntry.textContent = finalStep;
		recipeContainer.appendChild(recipeStepEntry);
	} 
}


function routeRecipe(evt){

	let targetElem = evt.target;
	let targetUrl = targetElem.getAttribute("data-name");
	let stateObj = {
		recipe: loadRecipePage(evt),
	}
	history.pushState(stateObj, "", targetUrl);	
}


//change handlebars template
function loadRecipeTemplate(templateTitle, index, data){
	let appContainer = document.querySelector(".main-content");
	let rawTemplate = document.getElementById(templateTitle).innerHTML;
	let compiledTemplate = Handlebars.compile(rawTemplate);
	let generatedHtml = compiledTemplate(dessertsArr[index]);
	appContainer.innerHTML = generatedHtml;
}

function loadLandingTemplate(templateTitle, dessertsArr){
	let appContainer = document.querySelector(".main-content");
	let rawTemplate = document.getElementById(templateTitle).innerHTML;
	let compiledTemplate = Handlebars.compile(rawTemplate);
	let generatedHtml = compiledTemplate(dessertsArr);
	appContainer.innerHTML = generatedHtml;

	return displayOnLandingPage(dessertsArr);
}

loadData();