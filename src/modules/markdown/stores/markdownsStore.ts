import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { Markdown } from '../models/markdown';

interface MarkdownRepository {
  id: string,
  source: Markdown,
  edit: string,
}

export const useMarkdownsStore = defineStore('markdownCache', () => {
  const repos = ref<MarkdownRepository[]>([]);

  const hasUnsaved = computed(
    () => !!repos.value.find((repo) => repo.source.content !== repo.edit),
  );

  const unsavedIds = computed(
    () => repos.value
      .filter((repo) => repo.source.content !== repo.edit)
      .map((repo) => repo.id),
  );

  function targetRepo(id: string): MarkdownRepository | undefined {
    return repos.value.find((repo) => repo.id === id);
  }

  function insert(md: Markdown, id: string) {
    if (!repos.value.find((repo) => repo.id === id)) {
      repos.value.push({
        id,
        source: md,
        edit: md.content,
      });
    }
  }

  function save(md: Markdown, id: string) {
    const target = repos.value.find((repo) => repo.id === id);
    if (target) {
      target.source = md;
    } else {
      repos.value.push({
        id,
        source: md,
        edit: md.content,
      });
    }
  }

  function updateEdit(newValue: string, id: string) {
    const target = repos.value.find((repo) => repo.id === id);
    if (target) {
      target.edit = newValue;
    }
  }

  function setDelete(isDeleted: boolean, id: string) {
    const target = repos.value.find((repo) => repo.id === id);
    if (target) {
      target.source.isDeleted = isDeleted;
    }
  }

  return {
    repos,
    hasUnsaved,
    unsavedIds,
    targetRepo,
    insert,
    save,
    updateEdit,
    setDelete,
  };
});
