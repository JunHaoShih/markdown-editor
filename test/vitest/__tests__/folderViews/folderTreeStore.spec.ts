import { createPinia, setActivePinia } from 'pinia';
import { FolderTreeNode, useFolderTreeStore } from 'src/modules/folderViews/stores/folderTreeStore';
import {
  beforeEach, describe, expect, it,
} from 'vitest';

describe('Test folderTreeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it.concurrent('Init', () => {
    const store = useFolderTreeStore();
    expect(store.treeNodes.length === 0);
    expect(store.selectedNodeParents.length === 0);
    expect(store.breadCrumbs.length === 0);
    expect(store.fileName === undefined);
  });

  function getDefaultTree(): FolderTreeNode[] {
    return [
      {
        id: '1',
        type: 'article',
        label: 'Title 1',
        children: [
          {
            id: '2',
            type: 'article',
            label: 'Title 2',
          },
          {
            id: '3',
            type: 'article',
            label: 'Title 3',
          },
        ],
      },
    ];
  }

  it.concurrent('Find filename', () => {
    const store = useFolderTreeStore();
    store.treeNodes = getDefaultTree();
    const found = !!store.findFileName('1');
    const alsoFound = !!store.findFileName('3');
    const notFound = !store.findFileName('5');
    expect(found && alsoFound);
    expect(notFound);
  });

  it.concurrent('Breadcrumbs', () => {
    const store = useFolderTreeStore();
    store.selectedNodeParents.push({
      id: '1',
      type: 'article',
      label: 'Title 1',
    });
    store.selectedNodeParents.push({
      id: '2',
      type: 'article',
      label: 'Title 2',
    });
    store.selectedNodeParents.push({
      id: '3',
      type: 'article',
      label: 'Title 3',
    });
    expect(store.fileName === 'Title 3');
  });
});
