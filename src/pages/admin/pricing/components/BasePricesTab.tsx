import type { RoomType } from '../../../../types/RoomType';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '../../../../../../frontend/src/components/my-card/components/ui/card';
import { Input } from '../../../../../../frontend/src/components/my-input/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../../../../frontend/src/components/Table';
import type { FC } from 'react';
import { CiEdit } from 'react-icons/ci';

type Props = {
    sortedRooms: RoomType[];
    rowEditing: string | null;
    priceEdits: Record<string, number>;
    setPriceEdits: (edits: Record<string, number>) => void;
    startRowEdit: (id: string, price: number) => void;
    cancelRowEdit: (id?: string) => void;
    saveRowPrice: (id?: string) => Promise<void>;
    fmt: (v?: number) => string;
};

const BasePricesTab: FC<Props> = ({
    sortedRooms,
    rowEditing,
    priceEdits,
    setPriceEdits,
    startRowEdit,
    cancelRowEdit,
    saveRowPrice,
    fmt,
}) => {
    return (
        <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">
                            Base Prices
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">
                            Configure standard nightly rates for each room type
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[color:var(--color-secondary)]/25 ">
                                <TableHead className="py-4 px-6 text-left text-sm font-semibold text-gray-800 tracking-wide">
                                    Room Type
                                </TableHead>

                                <TableHead className="flex justify-around py-4 px-6 text-center text-sm font-semibold text-gray-800 tracking-wide">
                                    Capacity
                                </TableHead>

                                <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-800 tracking-wide">
                                    Area
                                </TableHead>

                                <TableHead className="py-4 px-6 text-right text-sm font-semibold text-gray-800 tracking-wide">
                                    Price (VND)
                                </TableHead>

                                <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-800 tracking-wide w-32">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sortedRooms.map((rt) => {
                                const idStr = String(
                                    rt.roomTypeID ?? rt.id ?? rt.typeId ?? '',
                                );
                                const base = rt.basePrice ?? 0;
                                const isEditing = rowEditing === idStr;

                                return (
                                    <TableRow
                                        key={idStr}
                                        className="border-b hover:bg-gray-100/40 transition-colors"
                                    >
                                        <TableCell className="py-4 px-6">
                                            <span className="font-medium text-gray-900 text-[15px]">
                                                {rt.typeName}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-4 px-6 text-center text-gray-700">
                                            {rt.maxOccupancy ?? '—'}
                                        </TableCell>

                                        <TableCell className="py-4 px-6 text-left text-gray-700">
                                            {rt.size ?? rt.area
                                                ? `${rt.size ?? rt.area} m²`
                                                : '—'}
                                        </TableCell>

                                        <TableCell className="py-4 px-6">
                                            {isEditing ? (
                                                <div className="flex justify-end">
                                                    <Input
                                                        type="number"
                                                        className="h-10 w-36 rounded-lg text-right ring-1 ring-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                                                        value={
                                                            priceEdits[idStr] ??
                                                            base
                                                        }
                                                        onChange={(e) => {
                                                            setPriceEdits({
                                                                ...priceEdits,
                                                                [idStr]: Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-right block text-gray-900 font-semibold">
                                                    {fmt(base)}
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                saveRowPrice()
                                                            }
                                                            className="h-9 px-4 bg-[#c3923c] hover:bg-[#c18216] rounded-lg text-sm font-medium shadow-sm"
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                cancelRowEdit()
                                                            }
                                                            className="h-9 px-4 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            startRowEdit(
                                                                idStr,
                                                                base,
                                                            )
                                                        }
                                                        className="h-9 w-9 rounded-lg flex items-center justify-center bg-[--color-primary] hover:bg-[ --color-secondary] transition-colors group"
                                                        title="Edit price"
                                                    >
                                                        <CiEdit className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                                                    </button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default BasePricesTab;
