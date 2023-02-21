<template>
  <a-tree-select
    tree-data-simple-mode
    style="width: 100%"
    ref="directiveTreeSelect"
    v-model="directiveId"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
    :tree-data="treeData"
    :load-data="actionLoadTreeData"
    @change="actionChange"
    @select="actionSelect"
  ></a-tree-select>
</template>
<script>
import MdbDirectiveEntry from '../../../models/MdbDirectiveEntry.js'
import MyString from '../../../utils/datatype/MyString.js';
export default {
    name : 'DirectiveTreeSelect',
    props : {
        /**
         * directive id
         * @property {String|undefined}
         */
        value : {},
    },
    data() {
        return {
            treeDataInitId : null,
            directiveId : null,
            treeData : [],
        };
    },
    watch : {
        value() {
            if ( this.directiveId != this.value ) {
                this.directiveId = this.value;
                this.setupTreeData();
            }
        }
    },
    mounted() {
        this.directiveId = this.value;
        this.setupTreeData();
    },
    methods : {
        /**
         * setup directive tree data
         */
        async setupTreeData() {
            await this.actionLoadTreeData(null);
            if ( undefined == this.directiveId ) {
                return;
            }

            for ( let i=0; i<this.treeData.length; i++ ) {
                if ( this.treeData[i].value == this.directiveId ) {
                    return ;
                }
            }

            let entry = await MdbDirectiveEntry.findOne({
                type : 'directive',
                target : this.directiveId,
            });
            if ( null === entry ) {
                return ;
            }

            // if given directive id does not exists in loaded tree data at first level,
            // we need to push the directive item to the list.
            let directiveName = await entry.targetName();
            this.treeDataInitId = this.directiveId;
            this.treeData.unshift({ 
                id: entry.id, 
                pId: 0, 
                value: entry.target,
                title: directiveName,
                isLeaf: true,
                selectable : true,
                entry : entry,
            });
        },

        /**
         * load directive tree data
         * @param {Object|null} treeNode
         */
        async actionLoadTreeData( treeNode ) {
            let projectId = this.$store.getters.projectActivedId;
            let parentId = MyString.uuidNil();
            if ( null === treeNode ) {
                this.treeData = [];
                parentId = MyString.uuidNil();
            } else {
                parentId = treeNode.dataRef.id;
            }

            let entries = await MdbDirectiveEntry.findAll({project_id:projectId,parent_id:parentId});
            for ( let i=0; i<entries.length; i++ ) {
                if ( entries[i].target == this.treeDataInitId ) {
                    this.treeData.shift();
                }

                let item = { 
                    id: entries[i].id, 
                    pId: entries[i].parentId, 
                    title: await entries[i].targetName(),
                    isLeaf: 'directive' === entries[i].type,
                    selectable : 'directive' === entries[i].type,
                    entry : entries[i],
                    value : entries[i].target,
                    type : entries[i].type,
                };
                if ( 'folder' == entries[i].type ) {
                    item.value = `${entries[i].type}:${entries[i].target}`;
                }

                this.treeData.push(item);
            }

            this.treeData.sort(function( itemA, itemB ) {
                if ( itemA.type == itemB.type ) {
                    return itemA.title.localeCompare(itemB.title);
                } else {
                    return 'folder' == itemA.type ? -1 : 1;
                }
            });
        },

        /**
         * update v-model and emit change event on selector changed
         */
        actionChange() {
            this.$emit('input', this.directiveId);
            this.$emit('change');
        },

        /**
         * emit select event on selector selected
         */
        async actionSelect( value, node, extra ) {
            let directive = await node.dataRef.entry.getTargetModel();
            this.$emit('select', directive);
        },
    },
}
</script>