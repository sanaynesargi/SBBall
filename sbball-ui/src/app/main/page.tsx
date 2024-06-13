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
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout.tsx";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl.tsx";
import React from "react";

const SortableTable = ({
  data,
  defaultSortColumn,
  defaultSortColumn2,
  defaultSortColumn3,
  defaultSortOrder,
}: any) => {
  const [sortBy, setSortBy] = useState(defaultSortColumn);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);

  const [sortBy2, setSortBy2] = useState(defaultSortColumn2);
  const [sortOrder2, setSortOrder2] = useState(defaultSortOrder);

  const [sortBy3, setSortBy3] = useState(defaultSortColumn3);
  const [sortOrder3, setSortOrder3] = useState(defaultSortOrder);

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

  const handleSort3 = (column: any) => {
    if (sortBy3 === column) {
      setSortOrder3(sortOrder3 === "asc" ? "desc" : "asc");
    } else {
      setSortBy3(column);
      setSortOrder3("asc");
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

  useEffect(() => {
    setSortBy3(defaultSortColumn3);
    setSortOrder3(defaultSortOrder);
  }, [defaultSortColumn3, defaultSortOrder]);

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

  const sortedData3 = data.slice().sort((a: any, b: any) => {
    if (sortBy) {
      if (a[sortBy3] < b[sortBy3]) {
        return sortOrder3 === "asc" ? -1 : 1;
      }
      if (a[sortBy3] > b[sortBy3]) {
        return sortOrder3 === "asc" ? 1 : -1;
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
            <Th onClick={() => handleSort3("player")}>Player</Th>
            <Th onClick={() => handleSort3("fgA")}>FGM</Th>
            <Th onClick={() => handleSort3("fgM")}>FGA</Th>
            <Th onClick={() => handleSort3("tpfgM")}>2PM</Th>
            <Th onClick={() => handleSort3("tpfgA")}>2PA</Th>
            <Th onClick={() => handleSort3("ttpfgM")}>3PM</Th>
            <Th onClick={() => handleSort3("ttpfgA")}>3PA</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map((row: any, index: number) => (
            <Tr key={index}>
              <Td>{row.player}</Td>
              <Td>{row.fgM.toFixed(1)}</Td>
              <Td>{row.fgA.toFixed(1)}</Td>
              <Td>{row.tpfgM.toFixed(1)}</Td>
              <Td>{row.tpfgA.toFixed(1)}</Td>
              <Td>{row.ttpfgM.toFixed(1)}</Td>
              <Td>{row.ttpfgA.toFixed(1)}</Td>
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
              <Td>{row.fg.toFixed(2)}</Td>
              <Td>{row.tp.toFixed(2)}</Td>
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
  const [mode, setMode] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchPlayerData = async () => {
      const playerDataReq = await axios.get(
        `http://${apiUrl}/api/getPlayerAverages?mode=${mode ? "4v4" : "2v2"}`
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
  }, [mode]);

  return (
    <Layout>
      <Button
        colorScheme="blue"
        onClick={() => {
          setMode(!mode);
        }}
      >
        Game: {mode ? "Playoffs" : "Regular"}
      </Button>
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
