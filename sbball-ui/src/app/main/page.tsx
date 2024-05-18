"use client";
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useTab,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl.tsx";

const SortableTable = ({
  data,
  defaultSortColumn,
  defaultSortColumn2,
  defaultSortOrder,
}: any) => {
  const [sortBy, setSortBy] = useState(defaultSortColumn);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);
  const [sortBy2, setSortBy2] = useState(defaultSortColumn2);
  const [sortOrder2, setSortOrder2] = useState(defaultSortOrder);

  const handleSort = (column: any) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSort2 = (column: any) => {
    if (sortBy2 === column) {
      setSortOrder2(sortOrder2 === "asc" ? "desc" : "asc");
    } else {
      setSortBy2(column);
      setSortOrder2("asc");
    }
  };

  useEffect(() => {
    setSortBy(defaultSortColumn);
    setSortOrder(defaultSortOrder);
  }, [defaultSortColumn, defaultSortOrder]);

  useEffect(() => {
    setSortBy2(defaultSortColumn2);
    setSortOrder2(defaultSortOrder);
  }, [defaultSortColumn2, defaultSortOrder]);

  const sortedData = data.slice().sort((a: any, b: any) => {
    if (sortBy) {
      if (a[sortBy] < b[sortBy]) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (a[sortBy] > b[sortBy]) {
        return sortOrder === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  const sortedData2 = data.slice().sort((a: any, b: any) => {
    if (sortBy) {
      if (a[sortBy2] < b[sortBy2]) {
        return sortOrder2 === "asc" ? -1 : 1;
      }
      if (a[sortBy2] > b[sortBy2]) {
        return sortOrder2 === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  return (
    <VStack spacing="7vh">
      <Table
        variant="striped"
        size="sm"
        w="410px"
        h="50vh"
        colorScheme="blue"
        overflowX="scroll"
      >
        <Thead>
          <Tr>
            <Th onClick={() => handleSort("player")}>Player</Th>
            <Th onClick={() => handleSort("pts")}>PTS</Th>
            <Th onClick={() => handleSort("reb")}>REB</Th>
            <Th onClick={() => handleSort("ast")}>AST</Th>
            <Th onClick={() => handleSort("stl")}>STL</Th>
            <Th onClick={() => handleSort("blk")}>BLK</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map((row: any, index: number) => (
            <Tr key={index}>
              <Td>{row.player}</Td>
              <Td>{row.pts.toFixed(1)}</Td>
              <Td>{row.reb.toFixed(1)}</Td>
              <Td>{row.ast.toFixed(1)}</Td>
              <Td>{row.stl.toFixed(1)}</Td>
              <Td>{row.blk.toFixed(1)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Table
        variant="striped"
        size="sm"
        w="410px"
        h="50vh"
        colorScheme="blue"
        overflowX="scroll"
      >
        <Thead>
          <Tr>
            <Th onClick={() => handleSort2("player")}>Player</Th>
            <Th onClick={() => handleSort2("fg")}>FG%</Th>
            <Th onClick={() => handleSort2("tp")}>3P%</Th>
            <Th onClick={() => handleSort2("tov")}>TOV</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedData2.map((row: any, index: number) => (
            <Tr key={index}>
              <Td>{row.player}</Td>
              <Td>{row.fg.toFixed(3)}</Td>
              <Td>{row.tp.toFixed(3)}</Td>
              <Td>{row.tov.toFixed(1)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
};

const Home = () => {
  const [tableData, setTableData] = useState([]);
  const [playerCount, setPlayerCount] = useState(2);
  const toast = useToast();

  useEffect(() => {
    const fetchPlayerData = async () => {
      const playerDataReq = await axios.get(
        `http://${apiUrl}/api/getPlayerAverages?playerCount=${playerCount}`
      );

      const error = playerDataReq.data.error;

      if (error) {
        toast({
          title: "Error Fetching Data",
          description: `We couldn't pull your stats right now. Please try later.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setTableData(playerDataReq.data.data);
    };

    fetchPlayerData();
  }, [playerCount]);

  return (
    <Layout>
      <SortableTable
        data={tableData}
        defaultSortColumn="pts"
        defaultSortColumn2="fg"
        defaultSortOrder="desc"
      />
    </Layout>
  );
};

export default Home;
