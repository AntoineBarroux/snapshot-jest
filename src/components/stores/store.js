import Vuex from "vuex";
import Vue from 'vue'
import {moduleTest} from './moduleTest';

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        exampleStore: moduleTest
    }
});