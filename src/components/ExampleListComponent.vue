<template>
<!--  <div>-->
<!--    <p>Nombre d'éléments : {{ numberOfElements }}</p>-->

    <ul>
      <li v-for="item in items" :key="item.id">
        {{item.value}}
      </li>
    </ul>
<!--  </div>-->
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
            }),
            numberOfElements() {
              return this.items.length;
            }
        }
    }
</script>

<style>

</style>
