import { coreConfig } from '@elux/core';
import { computed, defineComponent } from 'vue';
export const DocumentHead = defineComponent({
  name: 'EluxDocumentHead',
  props: ['title', 'html'],

  setup(props) {
    const documentHead = computed(() => {
      let documentHead = props.html || '';

      if (props.title) {
        if (/<title>.*?<\/title>/.test(documentHead)) {
          documentHead = documentHead.replace(/<title>.*?<\/title>/, `<title>${props.title}</title>`);
        } else {
          documentHead = `<title>${props.title}</title>` + documentHead;
        }
      }

      return documentHead;
    });
    const router = coreConfig.UseRouter();
    return () => {
      router.setDocumentHead(documentHead.value);
      return null;
    };
  }

});