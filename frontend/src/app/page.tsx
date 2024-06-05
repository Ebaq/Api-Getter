'use client'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/Table'
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import axios from 'axios'
import { useEffect, useState } from 'react'

const columns = [
	{
		accessorKey: 'code',
		header: 'Код',
	},
	{
		accessorKey: 'createDate',
		header: 'Дата Создания',
	},
	{
		accessorKey: 'client',
		header: 'Клиент',
	},
	{
		accessorKey: 'name',
		header: 'Наименование',
	},
	{
		accessorKey: 'stage',
		header: 'Стадия',
	},
	{
		accessorKey: 'price',
		header: 'Сумма',
	},
	{
		accessorKey: 'currency',
		header: 'Валюта',
	},
]

export type data = {
	code: string
	createDate: string
	client: string
	name: string
	stage: string
	price: number
	currency: string
}

export default function Home() {
	const [data, setData] = useState<data[]>([
		{
			code: '',
			createDate: '',
			client: '',
			name: '',
			stage: '',
			price: 0,
			currency: '',
		},
	])
	const [messageSent, setMessageSent] = useState<boolean>(false)
	const [isPending, setIsPending] = useState<boolean>(false)
	const table = useReactTable({
		data: data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		enableColumnPinning: true,

		state: {
			columnPinning: {
				right: ['status'],
			},
		},
	})

	const getData = async () => {
		const response = await axios.get(
			'http://localhost:3001/api/v1/deals/all-deals'
		)
		setData(convertDate(response.data))
	}

	const convertDate = (deals: data[]) => {
		let temp = deals
		for (let i = 0; i < temp.length; i++) {
			temp[i].createDate = temp[i].createDate.split('T').join(' ')
		}
		return temp
	}

	const sendEmail = async () => {
		setIsPending(true)
		const response = await axios.post(
			'http://localhost:3001/api/v1/deals/send-email'
		)
		if (response.status == 201) {
			setMessageSent(true)
			setIsPending(false)
		}
	}

	useEffect(() => {
		getData()
	}, [])

	return (
		<>
			<main className='flex min-h-screen flex-col items-center justify-between bg-slate-500 h-full'>
				{data.length <= 1 ? (
					<img src='./owl.gif' alt='' />
				) : (
					<>
						<Table className='bg-slate-500'>
							<TableHeader className='sticky top-0 bg-white'>
								{table.getHeaderGroups().map(headerGroup => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map(header => {
											return (
												<TableHead
													key={header.id}
													className={
														header.column.getIsPinned()
															? 'sticky z-20 right-0 bg-gradient-to-r from-transparent to-[10%] to-black-default'
															: ''
													}
												>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext()
														  )}
												</TableHead>
											)
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody className='max-h-[500px] overflow-hidden'>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map(row => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && 'selected'}
										>
											{row.getVisibleCells().map(cell => (
												<TableCell
													key={cell.id}
													className={
														cell.column.getIsPinned()
															? 'sticky z-10 right-0'
															: ''
													}
												>
													<div
														className={`flex items-center justify-center text-white min-w-[70px] min-h-[28px] md:min-w-[80px] md:min-h-[35px] py-2 rounded-[6px]`}
													>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext()
														)}
													</div>
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className='h-24 text-center'
										>
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						<div className='m-24'>
							{messageSent ? (
								<button
									disabled
									className='rounded-[6px] p-4 bg-green-600 text-white transition-all'
								>
									Сообщение отправлено
								</button>
							) : (
								<button
									onClick={sendEmail}
									disabled={isPending}
									className='rounded-[6px] p-4 bg-[#9fa8da] text-white hover:bg-[#868db8] transition-all'
								>
									Отправить на почту
								</button>
							)}
						</div>
					</>
				)}
			</main>
		</>
	)
}
