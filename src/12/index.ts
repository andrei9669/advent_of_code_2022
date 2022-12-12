function* getNeighbours(x: number, y: number) {
  yield [y, x - 1];
  yield [y - 1, x];
  yield [y, x + 1];
  yield [y + 1, x];
}

type Node = { distance: number; previous: string | null };

let prev = [0, 0];
const render = (vertexes: Set<string>, map: string[][]) => {
  console.clear();
  [...vertexes].forEach((el) => {
    const [y, x] = el.split('_').map(Number);
    map[prev[0]][prev[1]] = '.';
    map[y][x] = '█';
    prev = [y, x];
  });

  const res = map.map((el) => el.join('')).join('\n');
  // eslint-disable-next-line no-promise-executor-return -- test
  console.log(res);
};

class Graph {
  vertices: string[] = [];

  adjacencyList: Record<string, Record<string, number>> = {};

  visited = new Set<string>();

  addVertex(vertex: string) {
    this.vertices.push(vertex);
    this.adjacencyList[vertex] = {};
  }

  addEdge(vertex1: string, vertex2: string, weight: number) {
    this.adjacencyList[vertex1][vertex2] = weight;
  }

  async dijkstra(
    source: string,
    finish: string,
    map: string[][],
  ): Promise<[Node | null, string[]]> {
    let fin: Node | null = null;
    const distances: Record<string, Node> = {};
    const touched: Record<string, Node> = {};
    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i] === source) {
        distances[source] = { distance: 0, previous: source };
      } else {
        distances[this.vertices[i]] = { distance: Infinity, previous: null };
      }
    }

    let currVertex = Graph.vertexWithMinDistance(distances, this.visited);
    while (currVertex !== null) {
      if (currVertex === finish) {
        fin = distances[currVertex];
      }
      const element = distances[currVertex];
      if (element !== undefined) delete touched[currVertex];
      const { distance } = element;

      const neighbors = this.adjacencyList[currVertex];
      Object.keys(neighbors).forEach((neighbor) => {
        const newDistance = distance + neighbors[neighbor];
        if (distances[neighbor].distance > newDistance) {
          distances[neighbor].distance = newDistance;
          distances[neighbor].previous = currVertex;
          touched[neighbor] = { distance: newDistance, previous: currVertex };
        }
      });
      this.visited.add(currVertex);
      const [yy, xx] = currVertex.split('_').map(Number);
      const stop = map[yy][xx];
      render(this.visited, map);
      if (stop === 'm') {
        debugger;
      }
      currVertex = Graph.vertexWithMinDistance(touched, this.visited);
    }
    let cur = finish;
    let res = [];
    res.push(cur);
    while (cur !== source) {
      const el = distances[cur];
      cur = el.previous || '';
      res.push(cur);
    }
    return [fin, res];
  }

  static vertexWithMinDistance(
    distances: Record<string, Node>,
    visited: Set<string>,
  ): null | string {
    let minDistance = Infinity;
    let minVertex = null;
    Object.keys(distances).forEach((vertex) => {
      const { distance } = distances[vertex];
      if (distance < minDistance && !visited.has(vertex)) {
        minDistance = distance;
        minVertex = vertex;
      }
    });
    return minVertex;
  }
}
const getWeight = (
  inputNumbers: string[][],
  [x, y]: [number, number],
  [X, Y]: [number, number],
): number | undefined => {
  let el1 = inputNumbers[y]?.[x];
  let el2 = inputNumbers[Y]?.[X];
  if (el1 === undefined || el2 === undefined) {
    return undefined;
  }
  const char1 = el1.charCodeAt(0);
  const char2 = el2.charCodeAt(0);
  const weight = char1 - char2;
  // TODO: get weights correct
  if (weight <= 0) {
    return 1;
  }
  if (weight === 1) {
    return 2;
  }
  return undefined;
};

const getVertex = (x: number, y: number) =>
  `${y.toString().padStart(5, '0')}_${x.toString().padStart(5, '0')}`;
export const main = async (input: string): Promise<unknown> => {
  let start = '';
  let end = '';
  const data: string[][] = input.split('\n').map((row, y) =>
    row.split('').map((el, x) => {
      if (el === 'S') {
        start = getVertex(x, y);
        return 'a';
      }
      if (el === 'E') {
        end = getVertex(x, y);
        return 'z';
      }
      return el;
    }),
  );

  const graph = new Graph();

  data.forEach((row, y) =>
    row.forEach((cell, x) => {
      const vertex1 = getVertex(x, y);
      graph.addVertex(vertex1);
      // eslint-disable-next-line no-restricted-syntax -- generator
      for (const [Y, X] of getNeighbours(x, y)) {
        const vertex2 = getVertex(X, Y);
        let weight = getWeight(data, [x, y], [X, Y]);
        const existing = graph.adjacencyList[vertex2];
        if (existing !== undefined) {
          weight = existing[vertex1];
        }
        if (weight !== undefined) {
          graph.addEdge(vertex1, vertex2, weight);
        }
      }
    }),
  );
  const [distance, res] = await graph.dijkstra(start, end, data);
  const path = res
    .map((el) => {
      const [y, x] = el.split('_').map(Number);
      return data[y][x];
    })
    .reverse();
  return path.length - 1;
};

export const main2 = (input: string): unknown => 0;
