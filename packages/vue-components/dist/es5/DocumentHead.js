import { coreConfig } from '@elux/core';
import { computed, defineComponent } from 'vue';
export var DocumentHead = defineComponent({
  name: 'EluxDocumentHead',
  props: ['title', 'html'],
  setup: function setup(props) {
    var documentHead = computed(function () {
      var documentHead = props.html || '';

      if (props.title) {
        if (/<title>.*?<\/title>/.test(documentHead)) {
          documentHead = documentHead.replace(/<title>.*?<\/title>/, "<title>" + props.title + "</title>");
        } else {
          documentHead = "<title>" + props.title + "</title>" + documentHead;
        }
      }

      return documentHead;
    });
    var router = coreConfig.UseRouter();
    return function () {
      router.setDocumentHead(documentHead.value);
      return null;
    };
  }
});