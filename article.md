# Tester le rendu de vos composants avec les snapshots Jest

La rédaction d'une batterie de tests complète est une bonne pratique qui est bien trop souvent délaissée
lors du développement d'une application. Dans le meilleur des cas, on va retrouver des tests côté backend 
mais il est certain que le frontend est très souvent délaissé à ce niveau là. Ils sont pourtant tout aussi 
importants car ils permettent de vérifier le bon fonctionnement de l'intéraction de l'utilisateur avec 
votre application (en plus d'assurer le bon comportement de vos méthodes comme c'est le cas pour votre 
serveur). Il existe évidemment des frameworks Javascript offrant les mêmes fonctionnalités que leurs compères 
backend, comme JUnit pour prendre l'exemple de l'écosystème Java. L'objectif de cet article est de se focaliser 
sur l'un d'eux, Jest, et plus particulièrement sur les snapshots, qui permettent de tester l'exactitude 
de l'affichage de vos composants.

*Les exemples dans cet article se basent sur une application VueJS.*

## Présentation de Jest

Jest est un framework de tests développé par Facebook qui prend place au sein de l’écosystème 
Javascript. A la base développé uniquement pour ReactJS, il est aujourd’hui possible de l’intégrer 
dans n'importe quelle application Javascript, notamment basée sur Angular ou VueJS. 
Ce framework est une surcouche de Jasmine, on y retrouvera donc la syntaxe habituelle 
(describe, it, expect, …). Pour l'installer, rien de plus simple : 
```
yarn add --dev jest
```
ou 
```
npm install --save-dev jest
```
selon votre gestionnaire de paquets favori. 

Pour vous donner un aperçu de son utilisation, un exemple vaut mieux qu'un long discours.
Pour vous mettre dans le contexte, on cherche à afficher une liste d'éléments, chargés à la création du 
composant par un store VueX : 

```
<template>
    <ul>
        <li v-for="item in items" :key="item.id">
            {{item.value}}
        </li>
    </ul>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";

    export default {
        name: 'ExampleListComponent',
        created() {
            this.loadItems();
        },
        methods: {
            ...mapActions({
                loadItems: 'exampleStore/loadItems'
            })
        },
        computed: {
            ...mapGetters({
                items: 'exampleStore/items'
            })
        }
    }
</script>
```

Ce que l'on souhaite tester ici, c'est que la méthode *loadItems* de notre store VueX est bel et bien 
appelée à la création de notre composant : 

```
// 1
const localVue = createLocalVue(); 
localVue.use(Vuex);

// 2
describe('Test du composant ExampleListComponent', () => {

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

    // 3
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
        // 4
        store.dispatch = jest.fn(() => Promise.resolve());
        // 5
        const wrapper = shallowMount(ExampleListComponent, {
            localVue, store
        });

        // 6
        wrapper.vm.$nextTick().then(() => {
            expect(store.dispatch).toHaveBeenCalledWith('exampleStore/loadItems');
            done();
        });
    });
});
```

Quelques explications : 
1. Création d'une instance de Vue permettant de ne pas polluer l'instance globale lors de vos tests.
2. Définition d'un scénario de test.
3. Mock du store VueX.
4. Mock de la méthode dispatch de notre store VueX (on ne souhaite pas ici récupérer les éléments mais 
juste tester l'appel à la méthode).
5. Création d'un wrapper autour du composant fraîchement créé. *shallowMount* permet de ne pas 
rendre les composants enfants et accélère donc le rendu de celui que vous souhaitez tester. On y 
passe ici notre vue locale ainsi que notre store VueX qui seront utilisés par la liste.
6. On s'attend à ce qu'un événement de type *exampleStore/loadItems* soit envoyé à notre store.

On peut vérifier que notre test passe : 
```
$ jest
 PASS  tests/unit/components/ExampleListComponentTest.spec.js
    ✓ Charge les données à la création du composant (11 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.943 s, estimated 1 s
Ran all test suites.

```

Pour plus de détails sur la syntaxe de Jest, je vous renvoie vers la [documentation officielle](https://jestjs.io/docs/en/getting-started).

Liksi propose d'ailleurs [une formation VueJS](https://www.liksi.fr/formation/) dans laquelle on retrouve une partie complète sur le test 
de composants avec ce framework.

## Tester l'affichage d'un composant 

Dans cet exemple, on teste le bon fonctionnement de notre composant et de son cycle de vie. Mais qu'en 
est-il de l'affichage de ce composant ? On ne vérifie pas que les items sont bien rendus. Il serait 
possible de rajouter une méthode d'affirmer que chaque élément de la liste soit correctement affiché, 
avec un code qui ressemblerait à ceci : 

```
it('Affiche correctement les items retournés par le store VueX', () => {
    const wrapper = shallowMount(ExampleListComponent, {
        localVue, store
    });

    const listItems = wrapper.findAll('li');
    expect(listItems.wrappers.map(wrapper => wrapper.element.textContent.trim())).toEqual(elements.map(elem => elem.value));
});
```

On vérifie bien que la liste a puce rendue affiche le champ value de chaque item retourné par notre store.
Le problème de cette solution est qu'elle est particulièrement longue à mettre en place si l'affichage 
de votre composant est complexe. Il faudra tester dans des méthodes séparées chaque élément rendu par celui-ci, 
mais le pire intervient lors de la modification du rendu. Imaginez que lors d'une correction, vous devez 
mettre à jour cette liste pour qu'elle affiche également le nombre d'éléments présents dans la liste : 
```
<template>
    ...
    <p>Nombre d'éléments : {{ numberOfElements }}</p>
    ...
</template>
<script>
    ...
        computed: {
            ...
            numberOfElements() {
              return this.items.length;
            }
        }
    ...
</script>
```

Et le test associé : 
```
it('Affiche correctement le nombre d\'éléments de la liste', () => {
    const wrapper = shallowMount(ExampleListComponent, {
        localVue, store
    });

    const numberOfItems = wrapper.find('p');
    const expected = `Nombre d'éléments : ${elements.length}`;
    expect(numberOfItems.element.textContent.trim()).toEqual(expected);
})
```

Voyez comme l'ajout d'un quelconque élément d'interface à votre composant alourdit votre scénario de tests ! 
Heureusement, Jest propose une fonctionnalité bien sympa pour éviter ça : les snapshots.

## Test Snapshot

Pour utiliser les snapshots, il nous faut ici installer une librairie permettant 
de serialiser nos composants en snapshots : 

```
npm install --save-dev jest-serializer-vue
```

*Note : Il existe bien sûr les librairies correspondantes pour React et Angular.*

Il nous faut ensuite préciser à Jest que la sérialisation de nos composants sera 
effectuée par cette librairie. Il faut donc modifier notre *jest.config.js* : 

```
...
snapshotSerializers: ["jest-serializer-vue"],
...
```

ou notre *package.json* : 

```
...
"jest": {
    "snapshotSerializers": ["jest-serializer-vue"]
  },
...
```

Le fonctionnement de ces tests est le suivant : on va rendre le composant et comparer le snapshot généré 
avec une référence, qui a été générée précédemment. Lors de la fin du développement d'un composant, 
on va donc générer un snapshot du rendu de celui-ci. Celui-ci permettra de s'assurer lors des développements 
futurs que l'affichage de votre interface n'a pas été impactée. On considère, au moment ou le snapshot est généré, 
que le rendu du composant est conforme à ce qui est attendu. 

Reprenons l'exemple de notre liste. On considère que la V1 de cette liste ne concerne 
que l'affichage de nos éléments sous la forme d'une liste à puce : 

```
it('S\'affiche correctement', () => {
    const wrapper = shallowMount(ExampleListComponent, {
        localVue, store
    });
    expect(wrapper.element).toMatchSnapshot();
});
```

Si l'on exécute nos tests, voici ce que l'on obtient : 
```
$ jest
 PASS  tests/unit/components/ExampleListComponentTest.spec.js
    ✓ Charge les données à la création du composant (12 ms)
    ✓ S'affiche correctement (6 ms)

 › 1 snapshot written.
Snapshot Summary
 › 1 snapshot written from 1 test suite.

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   1 written, 1 total
Time:        0.748 s, estimated 1 s
Ran all test suites.
```

Un snapshot a bien été écrit puisqu'il s'agit de la première exécution de ce test. Voici le contenu de ce snapshot : 
```
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`S'affiche correctement 1`] = `
<ul>
  <li>
    
        Premier élément
      
  </li>
  <li>
    
        Deuxieme élément
      
  </li>
</ul>
`;
```

Ce snapshot jouera le rôle de référence jusqu'à ce qu'il soit remplacé par une référence plus récente.
Si l'affichage de notre composant change, le test échouera. Imaginons maintenant que la V2 de ce composant 
incorpore le nombre d'éléments de la liste comme nous l'avons fait précédemment, voici ce que répondra Jest : 

```
$ jest
 FAIL  tests/unit/components/ExampleListComponentTest.spec.js
    ✓ Charge les données à la création du composant (12 ms)
    ✕ S'affiche correctement (7 ms)

  ●  › S'affiche correctement

    expect(received).toMatchSnapshot()

    Snapshot name: `S'affiche correctement 1`

    - Snapshot  -  9
    + Received  + 15

...

 › 1 snapshot failed.
Snapshot Summary
 › 1 snapshot failed from 1 test suite. Inspect your code changes or run `npm test -- -u` to update them.

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   1 failed, 1 total
Time:        0.761 s, estimated 1 s
Ran all test suites.

```

On est immédiatement notifiés que l'affichage de notre composant a évolué puisque le test échoue. D'ici, 
deux constats sont possibles : 
* Une évolution non souhaitée est apparue dans l'affichage de notre composant : il s'agit dans ce cas de 
corriger ce comportement afin que le rendu soit bien conforme à ce qui est attendu.
* L'évolution de l'affichage du composant est souhaitée : il faut alors mettre à jour le snapshot de référence.

Dans notre cas, l'évolution est voulue puisque nous passons de la V1 à la V2 de notre composant. Il suffit 
donc d'indiquer à Jest de mettre à jour le snapshot avec la commande suivante : 
```
jest -u
```

On obtient la confirmation que notre snapshot a bien été mis à jour : 

```
$ jest -u
 PASS  tests/unit/components/ExampleListComponentTest.spec.js
    ✓ Charge les données à la création du composant (12 ms)
    ✓ S'affiche correctement (4 ms)

 › 1 snapshot updated.
Snapshot Summary
 › 1 snapshot updated from 1 test suite.

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   1 updated, 1 total
Time:        0.735 s, estimated 1 s
Ran all test suites.
```

Et le contenu de notre snapshot de référence devient donc : 
```
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`S'affiche correctement 1`] = `
<div>
  <p>
    Nombre d'éléments : 2
  </p>
   
  <ul>
    <li>
      
      Premier élément
    
    </li>
    <li>
      
      Deuxieme élément
    
    </li>
  </ul>
</div>
`;
```

# Conclusion

Les snapshots Jest sont très utiles dans le cas où l'on souhaite contrôler l'évolution de l'affichage de 
nos composants. Ils sont très simples à mettre en place et permettent de ne pas à avoir à réécrire 
les tests lors de chaque modification de template. 

Il est important de noter que ces snapshots doivent être commités à l'aide de votre gestionnaire de version
préféré (ils deviennent sinon complètement obsolètes en cas de travail d'équipe).

## Liens
https://jestjs.io/docs/en/snapshot-testing
