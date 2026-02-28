import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const isSameDay = (a: Date, b: Date): boolean =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

const getFirstDayOfWeek = (year: number, month: number): number => new Date(year, month, 1).getDay();

type Props = {
    visible: boolean;
    title: string;
    value: Date;
    onSelect: (date: Date) => void;
    onClose: () => void;
};

export function CalendarPicker({ visible, title, value, onSelect, onClose }: Props) {
    const [viewYear, setViewYear] = useState(value.getFullYear());
    const [viewMonth, setViewMonth] = useState(value.getMonth());
    const [selected, setSelected] = useState(value);

    useEffect(() => {
        if (visible) {
            setViewYear(value.getFullYear());
            setViewMonth(value.getMonth());
            setSelected(value);
        }
    }, [visible, value]);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
    const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const handlePrevMonth = () => {
        setViewMonth((m) => {
            if (m === 0) {
                setViewYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    };

    const handleNextMonth = () => {
        setViewMonth((m) => {
            if (m === 11) {
                setViewYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
    };

    const handleDayPress = (day: number) => {
        const d = new Date(viewYear, viewMonth, day, 0, 0, 0, 0);
        setSelected(d);
    };

    const handleConfirm = () => {
        onSelect(selected);
        onClose();
    };

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d);
    }

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        rows.push(cells.slice(i, i + 7));
    }
    while (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
            while (lastRow.length < 7) {
                lastRow.push(null);
            }
        }
        break;
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>

                    {/* Month navigation */}
                    <View style={styles.monthNav}>
                        <Pressable onPress={handlePrevMonth} hitSlop={12}>
                            <Ionicons name="chevron-back" size={20} color={theme.colors.foreground} />
                        </Pressable>
                        <Text style={styles.monthLabel}>{monthLabel}</Text>
                        <Pressable onPress={handleNextMonth} hitSlop={12}>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.foreground} />
                        </Pressable>
                    </View>

                    {/* Weekday headers */}
                    <View style={styles.weekRow}>
                        {WEEKDAYS.map((wd) => (
                            <Text key={wd} style={styles.weekdayLabel}>{wd}</Text>
                        ))}
                    </View>

                    {/* Day grid */}
                    {rows.map((row, ri) => (
                        <View key={`row-${row[0] ?? ri}-${row[6] ?? ri}`} style={styles.weekRow}>
                            {row.map((day, ci) => {
                                if (day === null) {
                                    return <View key={`empty-${row[0] ?? ri}-pad${ci}`} style={styles.dayCell} />;
                                }
                                const cellDate = new Date(viewYear, viewMonth, day);
                                const isSelected = isSameDay(cellDate, selected);
                                const isToday = isSameDay(cellDate, new Date());

                                return (
                                    <Pressable
                                        key={`day-${day}`}
                                        style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                                        onPress={() => handleDayPress(day)}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            isSelected && styles.dayTextSelected,
                                            isToday && !isSelected && styles.dayTextToday,
                                        ]}>
                                            {day}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable onPress={handleConfirm} style={styles.confirmButton}>
                            <Text style={styles.confirmText}>Confirm</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: theme.colors.black40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius['2xl'],
        padding: theme.spacing.md,
        width: 7 * CELL_SIZE + theme.spacing.md * 2 + 16,
        borderWidth: 1,
        borderColor: theme.colors.white20,
    },
    title: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
        paddingHorizontal: 4,
    },
    monthLabel: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.base,
        fontWeight: '600',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    weekdayLabel: {
        width: CELL_SIZE,
        textAlign: 'center',
        color: theme.colors.white50,
        fontSize: theme.fontSize.xs,
        fontWeight: '600',
        paddingBottom: 6,
    },
    dayCell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: CELL_SIZE / 2,
    },
    dayCellSelected: {
        backgroundColor: theme.colors.primary,
    },
    dayText: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.sm,
    },
    dayTextSelected: {
        color: theme.colors.primaryForeground,
        fontWeight: '700',
    },
    dayTextToday: {
        color: theme.colors.yellow400,
        fontWeight: '700',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: theme.radius.md,
    },
    cancelText: {
        color: theme.colors.white70,
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
    },
    confirmButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
    },
    confirmText: {
        color: theme.colors.primaryForeground,
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
    },
});
