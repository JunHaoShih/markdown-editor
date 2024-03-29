import { createPinia, setActivePinia } from 'pinia';
import {
  beforeEach, describe, expect, it,
} from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { Markdown } from 'src/modules/markdown/models/markdown';
import { MarkdownRepository, useMarkdownsStore } from '../../../../src/modules/markdown/stores/markdownsStore';

describe('Test markdownStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it.concurrent('Init', () => {
    const stroe = useMarkdownsStore();
    expect(stroe.repos.length).toBe(0);
  });

  function getDefaultRepos(): MarkdownRepository[] {
    return [
      {
        id: '1',
        source: {
          content: '',
          userId: 'User1',
          isDeleted: false,
          createAt: Timestamp.now(),
          updateAt: Timestamp.now(),
        },
        edit: '',
      },
      {
        id: '2',
        source: {
          content: 'Test',
          userId: 'User1',
          isDeleted: false,
          createAt: Timestamp.now(),
          updateAt: Timestamp.now(),
        },
        edit: '',
      },
    ];
  }

  it.concurrent('Insert', () => {
    const store = useMarkdownsStore();
    const repos = getDefaultRepos();
    repos.forEach((repo) => store.insert(repo.source, repo.id));
    expect(store.repos.length).toBe(repos.length);
    store.repos.forEach((repo, index) => {
      expect(repo.edit).toBe(repo.source.content);
      expect(repo.source).toStrictEqual(repos[index].source);
    });
    // Test repeat insert
    repos.forEach((repo) => store.insert(repo.source, repo.id));
    expect(store.repos.length).toBe(repos.length);
  });

  it.concurrent('Get by id', () => {
    const store = useMarkdownsStore();
    const repos = getDefaultRepos();
    repos.forEach((repo) => store.insert(repo.source, repo.id));
    const exist = !!store.targetRepo('1');
    const notExist = !store.targetRepo('3');
    expect(exist).toBe(true);
    expect(notExist).toBe(true);
  });

  it.concurrent('Unsaved', () => {
    const store = useMarkdownsStore();
    const repos = getDefaultRepos();
    repos.forEach((repo) => store.insert(repo.source, repo.id));
    store.repos[0].edit = 'Yes';
    const { hasUnsaved, unsavedIds } = store;
    expect(hasUnsaved).toBe(true);
    expect(unsavedIds.length).toBe(1);
    expect(unsavedIds[0]).toBe('1');
  });

  it.concurrent('Save', () => {
    const store = useMarkdownsStore();
    const repos = getDefaultRepos();
    repos.forEach((repo) => store.insert(repo.source, repo.id));
    const newMd: Markdown = {
      content: 'TestNew',
      userId: 'User1',
      isDeleted: false,
      createAt: Timestamp.now(),
      updateAt: Timestamp.now(),
    };
    store.save(newMd, '1');
    expect(store.repos[0].source).toStrictEqual(newMd);
    store.save(newMd, '5');
    expect(store.repos[2].source).toStrictEqual(newMd);
  });

  it.concurrent('Update edit', () => {
    const store = useMarkdownsStore();
    const repos = getDefaultRepos();
    repos.forEach((repo) => store.insert(repo.source, repo.id));
    store.updateEdit('New edit', '1');
    expect(store.repos[0].edit).toBe('New edit');
  });

  it.concurrent('Set delete', () => {
    const store = useMarkdownsStore();
    const repos = getDefaultRepos();
    repos.forEach((repo) => store.insert(repo.source, repo.id));
    store.setDelete(true, '1');
    expect(store.repos[0].source.isDeleted).toBe(true);
  });
});
