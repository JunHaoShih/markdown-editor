import { defineStore } from 'pinia';
import { Markdown } from '../models/markdown';

interface MarkdownRepository {
  id: string,
  source: Markdown,
  edit: string,
}

interface MarkdownRepositoriesContainer {
  repos: MarkdownRepository[],
}

export const useMarkdownsStore = defineStore('markdownCache', {
  state: (): MarkdownRepositoriesContainer => ({
    repos: [],
  }),
  getters: {
    targetRepo: (state) => (id: string): MarkdownRepository | undefined => (
      state.repos.find((repo) => repo.id === id)
    ),
    hasUnsaved: (state): boolean => (
      !!state.repos.find((repo) => repo.source.content !== repo.edit)
    ),
    unsavedIds: (state) => (
      state.repos
        .filter((repo) => repo.source.content !== repo.edit)
        .map((repo) => repo.id)
    ),
  },
  actions: {
    insert(md: Markdown, id: string) {
      if (!this.repos.find((repo) => repo.id === id)) {
        this.repos.push({
          id,
          source: md,
          edit: md.content,
        });
      }
    },
    save(md: Markdown, id: string) {
      const target = this.repos.find((repo) => repo.id === id);
      if (target) {
        target.source = md;
      } else {
        this.repos.push({
          id,
          source: md,
          edit: md.content,
        });
      }
    },
    updateEdit(newValue: string, id: string) {
      const target = this.repos.find((repo) => repo.id === id);
      if (target) {
        target.edit = newValue;
      }
    },
    setDelete(isDeleted: boolean, id: string) {
      const target = this.repos.find((repo) => repo.id === id);
      if (target) {
        target.source.isDeleted = isDeleted;
      }
    },
  },
});
