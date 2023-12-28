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
    expect(store.treeNodes.length).toBe(0);
    expect(store.selectedNodeParents.length).toBe(0);
    expect(store.breadCrumbs.length).toBe(0);
    expect(store.fileName).toBe(null);
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
    expect(found).toBe(alsoFound);
    expect(notFound).toBe(true);
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
    expect(store.fileName).toBe('Title 3');
  });

  function getTravelTestTree(): {
    tree: FolderTreeNode[],
    cases: {
      start: FolderTreeNode | null,
      nextId: string | null,
      expand: boolean,
    }[],
    } {
    const rootNode: FolderTreeNode = {
      id: '1',
      type: 'article',
    };
    const childOne: FolderTreeNode = {
      id: '2',
      type: 'article',
      parent: rootNode,
    };
    const childTwo: FolderTreeNode = {
      id: '3',
      type: 'article',
      parent: rootNode,
    };
    rootNode.children = [childOne, childTwo];
    const subChildOne: FolderTreeNode = {
      id: '4',
      type: 'article',
      parent: childOne,
    };
    childOne.children = [subChildOne];
    return {
      tree: [rootNode],
      cases: [
        { start: childOne, nextId: rootNode.id, expand: true },
        { start: null, nextId: null, expand: true },
        { start: childTwo, nextId: subChildOne.id, expand: true },
        { start: childTwo, nextId: childOne.id, expand: false },
      ],
    };
  }

  it.concurrent('Get above node', () => {
    const store = useFolderTreeStore();
    const data = getTravelTestTree();
    store.treeNodes = data.tree;
    data.cases.forEach((testCase) => {
      const targetId = store.getNextNodeAbove(
        testCase.start,
        () => testCase.expand,
        '99',
      );
      expect(targetId).toBe(testCase.nextId ?? '99');
    });
  });

  function getTravelBelowTree(): {
    tree: FolderTreeNode[],
    cases: {
      start: FolderTreeNode| null,
      nextId: string | null,
      expand: boolean,
    }[],
    } {
    const rootNode: FolderTreeNode = {
      id: '1',
      type: 'article',
    };
    const childOne: FolderTreeNode = {
      id: '2',
      type: 'article',
      parent: rootNode,
    };
    const childTwo: FolderTreeNode = {
      id: '3',
      type: 'article',
      parent: rootNode,
    };
    rootNode.children = [childOne, childTwo];
    const subChildOne: FolderTreeNode = {
      id: '4',
      type: 'article',
      parent: childOne,
    };
    childOne.children = [subChildOne];
    return {
      tree: [rootNode],
      cases: [
        { start: subChildOne, nextId: childTwo.id, expand: true },
        { start: childOne, nextId: subChildOne.id, expand: true },
        { start: childTwo, nextId: childTwo.id, expand: true },
        { start: null, nextId: null, expand: true },
      ],
    };
  }

  it.concurrent('Get below node', () => {
    const store = useFolderTreeStore();
    const data = getTravelBelowTree();
    store.treeNodes = data.tree;
    data.cases.forEach((testCase) => {
      const targetId = store.getNextNodeBelow(
        testCase.start,
        () => testCase.expand,
        '99',
      );
      expect(targetId).toBe(testCase.nextId ?? '99');
    });
  });

  function getStepInTree(): {
    tree: FolderTreeNode[],
    cases: {
      start: FolderTreeNode| null,
      nextId: string | null,
      expand: boolean,
      setExpandTrigger: boolean,
    }[],
    } {
    const rootNode: FolderTreeNode = {
      id: '1',
      type: 'article',
    };
    const childOne: FolderTreeNode = {
      id: '2',
      type: 'article',
      parent: rootNode,
    };
    rootNode.children = [childOne];
    return {
      tree: [rootNode],
      cases: [
        {
          start: rootNode, nextId: rootNode.id, expand: false, setExpandTrigger: true,
        },
        {
          start: rootNode, nextId: childOne.id, expand: true, setExpandTrigger: false,
        },
        {
          start: null, nextId: null, expand: true, setExpandTrigger: false,
        },
      ],
    };
  }

  it.concurrent('Get step in node', () => {
    const store = useFolderTreeStore();
    const data = getStepInTree();
    store.treeNodes = data.tree;
    data.cases.forEach((testCase) => {
      let triggered = false;
      const targetId = store.getStepInNode(
        testCase.start,
        () => testCase.expand,
        () => {
          triggered = true;
        },
        '99',
      );
      expect(targetId).toBe(testCase.nextId ?? '99');
      expect(triggered).toBe(testCase.setExpandTrigger);
    });
  });

  function getStepOutTree(): {
    tree: FolderTreeNode[],
    cases: {
      start: FolderTreeNode| null,
      nextId: string | null,
      expand: boolean,
      setExpandTrigger: boolean,
    }[],
    } {
    const rootNode: FolderTreeNode = {
      id: '1',
      type: 'article',
    };
    const childOne: FolderTreeNode = {
      id: '2',
      type: 'article',
      parent: rootNode,
    };
    rootNode.children = [childOne];
    return {
      tree: [rootNode],
      cases: [
        {
          start: rootNode, nextId: rootNode.id, expand: true, setExpandTrigger: true,
        },
        {
          start: childOne, nextId: rootNode.id, expand: false, setExpandTrigger: false,
        },
        {
          start: null, nextId: null, expand: true, setExpandTrigger: false,
        },
      ],
    };
  }

  it.concurrent('Get step out node', () => {
    const store = useFolderTreeStore();
    const data = getStepOutTree();
    store.treeNodes = data.tree;
    data.cases.forEach((testCase) => {
      let triggered = false;
      const targetId = store.getStepOutNode(
        testCase.start,
        () => testCase.expand,
        () => {
          triggered = true;
        },
        '99',
      );
      expect(targetId).toBe(testCase.nextId ?? '99');
      expect(triggered).toBe(testCase.setExpandTrigger);
    });
  });
});
