import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// if (module.hot) {
//     module.hot.accept();
// }

const controlRecipes = async function() {
    try {
        const id = window.location.hash.slice(1);
        if (!id) return;
        recipeView.renderSpinner();

        // 0) Update results view to matk selected search result

        resultView.update(model.getSearchResultsPage());
        bookmarksView.update(model.state.bookmarks);

        // 1) Loading recipe
        await model.loadRecipe(id);
        // 2) Rendering recipe
        recipeView.render(model.state.recipe);
    } catch (err) {
        // console.error(err);
        recipeView.renderError();
    }
};

const controlSearchResults = async function() {
    try {
        resultView.renderSpinner();
        // 1) Get search query
        const query = searchView.getQuery();
        // if (!query && query === '') return;

        // 2) Load search results
        await model.loadSearchResults(query);

        // 3) Render results
        resultView.render(model.getSearchResultsPage());

        // 4) Render initial pagination

        paginationView.render(model.state.search);
    } catch (err) {
        console.log(err);
    }
};

const controlPagination = function(goToPage) {
    // 3) Render NEW results
    resultView.render(model.getSearchResultsPage(goToPage));

    // 4) Render NEW initial pagination

    paginationView.render(model.state.search);
    console.log(goToPage);
};

const controlServing = function(newServings) {
    // Update the recipe servings (in state)
    model.updateServings(newServings);
    // Update the recipe view
    // recipeView.render(model.state.recipe);
    recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
    // 1) Add or remove bookmark
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);

    // 2) Update recipe view
    recipeView.update(model.state.recipe);

    //3) Render bookmarks
    bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function() {
    bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe) {
    try {
        // Show loading spinner
        addRecipeView.renderSpinner();
        // Upload the new recipe data
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        // Render recipe
        recipeView.render(model.state.recipe);

        // Success message
        addRecipeView.renderMessage();

        // Render bookmark view
        bookmarksView.render(model.state.bookmarks);

        // Change ID in URL

        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // Close form window
        setTimeout(function() {
            addRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        console.error('🚨🚨🚨🚨', err);
        addRecipeView.renderError(err.message);
    }
};

const init = function() {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServings(controlServing);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchView.addSearchHandler(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);
    console.log('Welcome to our first semi pro app');
};

init();

const clearBookmark = function() {
    localStorage.clear('bookmarks');
};
// clearBookmark()