<template>
  <div class="d-inline-block">
    <a-badge :count="actions.length">
      <a-icon v-show="isRecording" class="mr-1" type="video-camera"/>
    </a-badge>
    
    <a-modal v-if="modalEnabel" v-model="modalEnabel" :bodyStyle="{padding:0}">
      <template slot="title">
        {{$t('app.actionRecorderTitle')}}
        <div class="text-muted"><small>{{$t('app.actionRecorderDesc')}}</small></div>
      </template>
      <a-textarea :value="scriptContent" :rows="15" class="script-content-textarea"/>
      <template slot="footer">
        <a-button v-if="!isRecording" type="primary" @click="actionStart">{{$t('button.start')}}</a-button>
        <a-button v-else type="danger" @click="actionStop">{{$t('button.stop')}}</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script>
export default {
    name : 'AppActionRecorder',
    data() {
        return {
            /**
             * if recorder modal enabled or not
             * @property {Boolean}
             */
            modalEnabel : false,
            /**
             * list of actions
             * @protected {Array<Object>}
             */
            actions : [],
            /**
             * map of event handlers
             * @property {Object<String:Function>}
             */
            eventHandlers : {},
            /**
             * indicate whether recorder is working.
             * @property {Boolean}
             */
            isRecording : false,
            /**
             * list of script lines
             * @property {Array<string>}
             */
            contents : [],
        };
    },
    computed : {
        /**
         * generate script content
         * @returns {String}
         */
        scriptContent() {
            return `it('unnamed functional test', async () => {
    let tester = await FunctionalSetup.setup();
    /* actions start */
${this.contents.join('\n')}
    /* actions end */
});`;
        }
    },
    mounted() {
        this.$eventBus.$on('menu-help-action-record-clicked', () => this.actionModalEnable());
    },
    methods : {
        /**
         * enable recorder modal
         */
        actionModalEnable () {
            this.modalEnabel = true;
            this.$forceUpdate();
        },
        
        /**
         * start recording
         */
        actionStart() {
            this.eventHandlers['mousedown'] = e => this.eventHandlerForMousedown(e);
            window.addEventListener('mousedown', this.eventHandlers['mousedown']);
            
            this.eventHandlers['keydown'] = e => this.eventHandlerForKeydown(e);
            window.addEventListener('keydown', this.eventHandlers['keydown']);

            this.actions = [];
            this.contents = [];
            this.modalEnabel = false;
            this.isRecording = true;
        },

        /**
         * stop recording
         */
        actionStop() {
            this.actions = [];

            window.removeEventListener('keydown', this.eventHandlers['keydown']);
            window.removeEventListener('mousedown', this.eventHandlers['mousedown']);
            this.isRecording = false;
        },

        /**
         * event handler for keydown event.
         * @param {MouseEvent} e
         */
        eventHandlerForKeydown( e ) {
            let action = {};
            action.time = (new Date()).getTime();
            action.action = 'input';
            this.contents.push(`    // Input : ${e.target.textContent}`);

            action.target = e.target;
            let selector = this.generateQuerySelectorByNode(e.target);
            this.contents.push(`    await tester.input('${selector}', '${e.key}');`);

            if ( 0 < this.actions.length ) {
                let delay = action.time - this.actions[this.actions.length - 1].time;
                this.contents.push(`    await tester.msleep(${delay});`);
            }

            console.log(`input [${e.key}]: ${selector}`);
            this.actions.push(action);
        },

        /**
         * event handler for mousedown event.
         * @param {MouseEvent} e
         */
        eventHandlerForMousedown( e ) {
            let action = {};
            action.time = (new Date()).getTime();
            action.action = 'click';
            this.contents.push(`    // Click : ${e.target.textContent}`);

            action.target = e.target;
            let selector = this.generateQuerySelectorByNode(e.target);
            this.contents.push(`    await tester.click('${selector}');`);

            if ( 0 < this.actions.length ) {
                let delay = action.time - this.actions[this.actions.length - 1].time;
                this.contents.push(`    await tester.msleep(${delay});`);
            }

            console.log(`click: ${selector}`);
            this.actions.push(action);
        },

        /**
         * generate query selector by given path
         * @param {Object} node
         * @returns {String}
         */
        generateQuerySelectorByNode( node ) {
            let parts = [];
            let parentNode = null;
            do {
                let tagName = node.tagName.toLowerCase();
                parentNode = node.parentNode;
                if ( 'body' === tagName || null === parentNode ) {
                    break;
                }

                let stepResult = this.getNodeSelectorPartById(node, parts);
                if ( 'stop' === stepResult ) {
                    break ; 
                }
                stepResult = this.getNodeSelectorPartByClass(node, parts);
                if ( 'stop' === stepResult ) {
                    break ; 
                }
                if ( 'ok' === stepResult ) {
                    node = parentNode;
                    continue ;
                }
                stepResult = this.getNodeSelectorPartByTag(node, parts);
                if ( 'stop' === stepResult ) {
                    break ; 
                }
                if ( 'ok' === stepResult ) {
                    node = parentNode;
                    continue ;
                }
            } while ( parentNode != null );

            parts.reverse();
            let selector = parts.join(' > ');
            return selector;
        },

        /**
         * get node selector part by tag
         * @returns {Boolean}
         */
        getNodeSelectorPartByTag(node, parts) {
            let parentNode = node.parentNode;
            let tagName = node.tagName.toLowerCase();
            if ( 1 === parentNode.children.length ) {
                parts.push(tagName);
                return 'ok';
            }

            for ( let i=0; i<parentNode.children.length; i++ ) {
                if ( node === parentNode.children[i] ) {
                    parts.push(`${tagName}:nth-child(${i+1})`);
                    return 'ok';
                }
            }

            throw Error('unable to locate elem');
        },

        /**
         * get node selector part by class
         * @returns {Boolean}
         */
        getNodeSelectorPartByClass (node, parts) {
            if ( 0 === node.classList.length ) {
                return 'ignore';
            }

            let classList = [];
            node.classList.forEach(item => classList.push(item));
            classList.sort((a,b) => b.length - a.length);

            let parentNode = node.parentNode;
            let tagName = node.tagName.toLowerCase();
            for ( let i=0; i<classList.length; i++ ) {
                let selector = `${tagName}.${classList[i]}`;
                if ( 1 == document.getElementsByClassName(classList[i]).length ) {
                    parts.push(selector);
                    return 'stop';
                }
                if ( 1 == parentNode.getElementsByClassName(classList[i]).length ) {
                    parts.push(selector);
                    return 'ok';
                }
            }
            return 'ignore';
        },

        /**
         * get node selector part by id
         * @returns {Object}
         */
        getNodeSelectorPartById( node, parts ) {
            let id = node.id || '';
            if ( 0 !== id.length ) {
                parts.push(`#${id}`);
                return 'stop';
            }
            return 'ignore';
        }
    }
}
</script>
<style scoped>
.script-content-textarea {border:none !important;background: #1f1f1f;color: #a6a6a6;border-radius: 0 !important;}
.script-content-textarea:focus {border:none;outline: none; box-shadow: none !important;}
</style>