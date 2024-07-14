# Second-brain

<p align="center">
Welcome to Second Brain! The open source graph-based
3d Second Brain.
</p>

## Product Usage

This library is commonly used in graph based folder structure.

Example usage:

 [Screencast from 2024년 07월 14일 13시 30분 33초.webm](https://github.com/user-attachments/assets/988cf657-3612-4aac-95b1-9d7c4a1cf8d5)


see our service @ https://scripmind.com/

### Prerequisite, You need to have a follow this data structure.

##### 1. Directory

This data structure represents a MongoDB document that describes a folder named "home" in a hierarchical or tree-like data structure.

- `_id`: This field is the unique identifier for the document in the MongoDB collection or Key field of document collection. It doesn't need to be MongoDB

- `name`: This field holds the name of the folder, in the root it should be`"home"`.

- `type`: This field indicates the type of the item, which is a `"folder" or "file`.

- `children`: This is an array that represents the child items within this folder. Currently, it is an empty array (`[]`), indicating that there are no child items (subfolders or files) inside this folder.

Example Data Structure:

```json
[
  {
    "_id": "65f8141d919d86944918b14f",
    "name": "home",
    "type": "folder",
    "children": [
      {
        "name": "단국대학교 천안 캠퍼스",
        "type": "file",
        "children": [],
        "_id": "666c4d48e7b9d390c11c2992"
      },
      {
        "name": "Default Folder",
        "type": "folder",
        "_id": "667fafea4cba66cf5b8b72ce",
        "children": [
          {
            "name": "example",
            "type": "file",
            "children": [],
            "_id": "667faff14cba66cf5b8b72d8"
          }
        ]
      }
    ]
  }
]
```

#### Files

Document Structure
Each document contains the following fields:

1. \_id: A unique identifier for the document (string).
2. name: The name of the note (string).
3. tags: An array of tags associated with the note (array of strings).

Example Data Structure:

```json
[
  {
    "_id": "666c4d48e7b9d390c11c2992",
    "name": "단국대학교 천안 캠퍼스",
    "tags": ["#0"],
  {
    "_id": "667faff14cba66cf5b8b72d8",
    "name": "example",
    "tags": []
  }
]
```

### How to use

Let's assume you have a directory and list of files.

RootDirectory

```js
const rootDirectory = {
  _id: "65f8141d919d86944918b14f",
  name: "home",
  type: "folder",
  children: [
    {
      name: "단국대학교 천안 캠퍼스",
      type: "file",
      children: [],
      _id: "666c4d48e7b9d390c11c2992",
    },
    {
      name: "Default Folder",
      type: "folder",
      _id: "667fafea4cba66cf5b8b72ce",
      children: [
        {
          name: "example",
          type: "file",
          children: [],
          _id: "667faff14cba66cf5b8b72d8",
        },
      ],
    },
  ],
};
```

```js
const files = [
  {
    "_id": "666c4d48e7b9d390c11c2992",
    "name": "단국대학교 천안 캠퍼스",
    "tags": ["#0"],
  {
    "_id": "667faff14cba66cf5b8b72d8",
    "name": "example",
    "tags": []
  }
]
```

```javascript
// Make a Graph
const graph = Graph.createFromApp(rootDirectory, files);

// Clone Graph
const partialGraph = graph?.clone();

// Get Local Graph, graph Id can be NodeId
graph?.clone().getLocalGraph(graphId);
```

### Example usages with Utilization

Following Code is the real code of 3d graph feature of service scriptmind. This is a hook for 3d graph view.

```javascript
import { useEffect, useState } from "react";
import ForceGraph3D from "3d-force-graph";
import elementResizeDetectorMaker from "element-resize-detector";
import { Graph } from "scriptmind-second-brain";
import useGetDirectories from "./useGetDirectories";
import useGetAllFiles from "./useGetAllFiles";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

export default function useGraph(dashboardId: string) {
  const graphRef = document.getElementById("3d-graph");
  const { data: rootDirectory } = useGetDirectories();
  const { data: files } = useGetAllFiles();
  const [graphData, setGraphData] = useState<Graph>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const graphId = searchParams.get("graph");
  const { systemTheme, theme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    if (rootDirectory && files) {

    // core logic using Graph
      const graph = Graph.createFromApp(rootDirectory, files);

    // Let's assume you go graph='id' param via node click, this logic will make local graph based on the param id
      const partialGraph = graphId
        ? graph?.clone().getLocalGraph(graphId)
        : graph;
      setGraphData(partialGraph);
    }
  }, [files, graphId, rootDirectory]);

  useEffect(() => {
    if (graphRef && graphData) {
      const Graph = ForceGraph3D({ controlType: "orbit" })(graphRef)
        .graphData(graphData)
        .backgroundColor(currentTheme === "dark" ? "black" : "white")
        .nodeLabel("id")
        .nodeLabel((node: any) => {
          const textColor = getComputedStyle(document.documentElement)
            .getPropertyValue("--text-normal")
            .trim();
          return `<div style="color:${
            currentTheme === "dark" ? "white" : "black"
          };">${node.name}</div>`;
        })
        .nodeColor((node: any) => {
          // ignore this dark mode
          return currentTheme === "dark"
            ? !files?.find((file) => file._id === node.id) &&
              node.name === "home"
              ? "white"
              : !files?.find((file) => file._id === node.id)
              ? "#606060"
              : "#C0C0C0"
            : !files?.find((file) => file._id === node.id) &&
              node.name === "home"
            ? "black"
            : !files?.find((file) => file._id === node.id)
            ? "#606060"
            : "#C0C0C0";
        })
        .linkColor((link) => (currentTheme === "dark" ? "white" : "black"))
        .onNodeClick((node: any) => {
          // Navigate to the node's graph ID without reloading the page
          if (node.id) {
            router.push(`/graph?graph=${node.id}`);
          }
        })
        .linkThreeObjectExtend(true);

      Graph.cameraPosition({ z: 200 }); // Adjust the 'z' value to move the camera closer or further

      elementResizeDetectorMaker().listenTo(graphRef, (el) =>
        Graph.width(el.offsetWidth)
      );
    }
  }, [currentTheme, files, graphData, graphRef, router]);

  return { graphRef };
}
```

Following Code is the real code of tree hooks of service scriptmind. This is a hook for panel view.

```javascript
import useGetAllFiles from "@/components/graph/hooks/useGetAllFiles";
import useGetFolders from "./useGetFolders";
import { Graph } from "scriptmind-second-brain";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { sortChildren } from "../utils";
import { ITreeNode } from "@/db";

export function useTree() {
  const router = useRouter();
  const { data, isPending } = useGetFolders();
  const { data: files } = useGetAllFiles();
  const [folderOpenLists, setFolderOpenLists] = useState<string[]>([]);

  const searchParams = useSearchParams();

  const graphId = searchParams.get("graph");
  const currentPath = usePathname().split("/").pop();
  const dashboardId = graphId || currentPath || "home";

  const homeId = data?._id;
  const sortedTree = [sortChildren(data)];

  const graph = useMemo(() => {
    if (!data || !files) return;

    return Graph.createFromApp(sortChildren(data), files); // Create graph data structure
  }, [data, files]);

  useEffect(() => {
    const retrieveLinks = (
      graph: Graph,
      id: string,
      culmultives: string[] = []
    ): string[] => {
      const link = graph.links.find((link) => link.target === id);
      if (!link) return culmultives;
      culmultives.push(link.source);
      return retrieveLinks(graph, link.source, culmultives);
    };
    if (graph) {
      const currentNode = graph.nodes?.find((node) => {
        return node.id === dashboardId;
      });

      setFolderOpenLists([
        ...retrieveLinks(graph, currentNode?.id ?? ""),
        dashboardId,
      ]);
    }
  }, [dashboardId, graph]);

  const getCurrentFolder = (node: ITreeNode) => {
    if (dashboardId !== node._id) router.push(`/dashboard/${node._id}`);
  };

  return {
    folderOpenLists,
    homeId,
    sortedTree,
    dashboardId,
    isPending,
    getCurrentFolder,
    router,
  };
}
```
