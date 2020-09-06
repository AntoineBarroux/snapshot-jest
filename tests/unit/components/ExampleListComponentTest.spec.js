import {createLocalVue, shallowMount} from "@vue/test-utils";
import Vuex from "vuex";
import ExampleListComponent from "../../../src/components/ExampleListComponent";

const localVue = createLocalVue();
localVue.use(Vuex);

describe('', () => {

    let store;
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

    beforeEach(() => {
        store = new Vuex.Store({
            modules: {
                exampleStore: {
                    namespaced: true,
                    state: {
                        items: elements
                    },
                    actions: {
                        loadItems: jest.fn(() => Promise.resolve(elements)),
                    },
                    getters: {
                        'items': state => state.items
                    }
                }
            }
        });
    });

    it('Charge les données à la création du composant', (done) => {
        store.dispatch = jest.fn(() => Promise.resolve());
        const wrapper = shallowMount(ExampleListComponent, {
            localVue, store
        });

        wrapper.vm.$nextTick().then(() => {
            expect(store.dispatch).toHaveBeenCalledWith('exampleStore/loadItems');
            done();
        });
    });

    it('S\'affiche correctement', () => {
        const wrapper = shallowMount(ExampleListComponent, {
            localVue, store
        });
        expect(wrapper.element).toMatchSnapshot();
    });
});
