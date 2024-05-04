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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl.tsx";

const SortableTable = ({ data, defaultSortColumn, defaultSortOrder }: any) => {
  const [sortBy, setSortBy] = useState(defaultSortColumn);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);

  const handleSort = (column: any) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    setSortBy(defaultSortColumn);
    setSortOrder(defaultSortOrder);
  }, [defaultSortColumn, defaultSortOrder]);

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

  return (
    <Table variant="striped" size="sm" h="50vh" colorScheme="blue">
      <Thead>
        <Tr>
          <Th onClick={() => handleSort("player")}>Player</Th>
          <Th onClick={() => handleSort("pts")}>PTS</Th>
          <Th onClick={() => handleSort("reb")}>REB</Th>
          <Th onClick={() => handleSort("ast")}>AST</Th>
          <Th onClick={() => handleSort("stl")}>STL</Th>
          <Th onClick={() => handleSort("blk")}>BLK</Th>
          <Th onClick={() => handleSort("tov")}>TOV</Th>
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
            <Td>{row.tov.toFixed(1)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
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
        defaultSortOrder="desc"
      />
    </Layout>
  );
};

export default Home;
