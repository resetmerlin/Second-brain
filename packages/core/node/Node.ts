import { TFile, TFolder } from "../../types";
import { Link } from "../link";

export default class Node {
  public readonly id: string;
  public readonly name: string;
  public readonly val: number; // = weight, currently = 1 because scaling doesn't work well

  public readonly neighbors: Node[];
  public readonly links: Link[];
  public readonly tags: string[];

  constructor(
    name: string,
    id: string,
    val = 10,
    neighbors: Node[] = [],
    links: Link[] = [],
    tags: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.val = val;
    this.neighbors = neighbors;
    this.links = links;
    this.tags = tags;
  }

  /** Creates an array of nodes from an array of files */
  static createFromFiles(
    app: Omit<TFolder, "children">[],
    files: TFile[]
  ): [Node[], Map<string, number>] {
    const nodeMap = new Map<string, number>();
    return [
      app
        .map((directory, index) => {
          const node = new Node(directory.name, directory._id);

          if (directory.type === "file") {
            const file = files.find((file) => file._id === directory._id);

            if (file?.tags != null) {
              // stores tags without leading octothorpe `#` as ["tag1", "tag2", ...]
              file?.tags.forEach((tag) => node.tags.push(tag.substring(1)));
            }
          }

          if (!nodeMap.has(node.id)) {
            nodeMap.set(node.id, index);
            return node;
          }
          return null;
        })
        .filter((node) => node !== null) as Node[],
      nodeMap,
    ];
  }

  /**  Links together two nodes as neighbors (node -> neighbor) */
  addNeighbor(neighbor: Node): Link | null {
    if (!this.isNeighborOf(neighbor)) {
      const link = new Link(this.id, neighbor.id);
      this.neighbors.push(neighbor);
      this.addLink(link);

      neighbor.neighbors.push(this);
      neighbor.addLink(link);

      return link;
    }
    return null;
  }

  /** Pushes a link to the node's links array if it doesn't already exist */
  addLink(link: Link) {
    if (
      !this.links.some(
        (l) => l.source === link.source && l.target === link.target
      )
    ) {
      this.links.push(link);
    }
  }

  /** Whether the node is a neighbor of another node */
  public isNeighborOf(node: Node | string) {
    if (node instanceof Node) return this.neighbors.includes(node);
    else return this.neighbors.some((neighbor) => neighbor.id === node);
  }
}
