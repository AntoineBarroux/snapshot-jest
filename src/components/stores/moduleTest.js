import Vue from 'vue'

const elements = [
    {
        id: '1',
        value: 'Premier élément'
    },
    {
        id: '2',
        value: 'Deuxieme élément'
    }
];

export const moduleTest = {
    namespaced: true,

    state: {
        items: []
    },

    mutations: {
        setItems: (state, data) => {
            Vue.set(state, 'items', data);
        }
    },

    actions: {
        loadItems: ({commit}) => {
            return new Promise((resolve) => {
                commit("setItems", elements);
                resolve();
            });
        }
    },

    getters: {
        items: state => state.items
    }
};