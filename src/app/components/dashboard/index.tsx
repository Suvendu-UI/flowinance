"use client";

import { useSupabase } from "@/app/supabase-provider";
import { Transaction } from "@/app/types/global";
import { AppContext } from "@/lib/context";
import {
  createDate,
  decryptTransactions,
  getTransactions,
  getUserId,
  getWeek,
} from "@/lib/utils";
import { useEffect, useState } from "react";
import { Balance } from "./total/balance";
import { Expenses } from "./total/expenses";
import { Incomes } from "./total/incomes";
import ExpensesChart from "./expenses/expenses-chart";
import IncomesChart from "./incomes/incomes-chart";
import { IncomesPieChart } from "./incomes-by-categories/incomes-piechart";
import { ExpensesPieChart } from "./expenses-by-categories/expenses-piechart";
import { ExpensesTable } from "./expenses-by-categories/expenses-table";
import { IncomesTable } from "./incomes-by-categories/incomes-table";
import ExpensesEvolutionChart from "./expenses/expenses-evolution-chart";
import IncomesEvolutionChart from "./incomes/incomes-evolution-chart";
import { DashboardRow } from "./ui/dashboard-row";
import { LastTransactions } from "./last-transactions";
import Loading from "@/app/loading";
import { Filter } from "./filter";
import { useToast } from "../ui/use-toast";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const { supabase } = useSupabase();
  const [selected, setSelected] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const userId = await getUserId(supabase);

      if (!userId) {
        return;
      }
      const data = await getTransactions(supabase, userId);

      if (!data) {
        toast({
          description:
            "❎ Error fetching transactions. Please, try again later.",
        });
      } else {
        const decryptData = decryptTransactions(data, userId);
        setTransactions(decryptData);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth();

    if (isYearSelected()) {
      const filtered = transactions.filter((transaction) => {
        const date = createDate(transaction.date);
        return date.getFullYear() === thisYear;
      });
      setFilteredTransactions(filtered);
    } else if (isMonthSelected()) {
      const filtered = transactions.filter((transaction) => {
        const date = createDate(transaction.date);
        return date.getFullYear() === thisYear && date.getMonth() === thisMonth;
      });
      setFilteredTransactions(filtered);
    } else if (isWeekSelected()) {
      const filtered = transactions.filter((transaction) => {
        const date = createDate(transaction.date);
        const transactionWeek = getWeek(date);
        const thisWeek = getWeek(today);
        return date.getFullYear() === thisYear && transactionWeek === thisWeek;
      });
      setFilteredTransactions(filtered);
    }
  }, [selected, transactions]);

  function isWeekSelected() {
    return selected === 2;
  }

  function isYearSelected() {
    return selected === 0;
  }

  function isMonthSelected() {
    return selected === 1;
  }

  return transactions.length !== 0 ? (
    <AppContext.Provider
      value={{ filteredTransactions, transactions, selected, setSelected }}
    >
      <div className="flex flex-col w-1/2 gap-10">
        <Filter />
        <DashboardRow className="justify-between mb-10">
          <Balance />
          <div className="flex gap-2">
            <Expenses />
            <Incomes />
          </div>
        </DashboardRow>

        <DashboardRow className="justify-center">
          <ExpensesTable />
          <IncomesTable />
        </DashboardRow>

        <DashboardRow className="justify-center">
          <ExpensesPieChart />
          <IncomesPieChart />
        </DashboardRow>

        <DashboardRow className="justify-center">
          <ExpensesChart />
          <IncomesChart />
        </DashboardRow>

        <DashboardRow className="justify-center">
          <ExpensesEvolutionChart />
          <IncomesEvolutionChart />
        </DashboardRow>
        <DashboardRow className="justify-center">
          <LastTransactions />
        </DashboardRow>
      </div>
    </AppContext.Provider>
  ) : (
    <Loading />
  );
}
