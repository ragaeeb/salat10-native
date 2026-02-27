import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import { Animated, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { formatCitation } from '@/lib/quotes';
import type { Quote } from '@/types/quote';

const SITE_NAME = 'Salat10';
const SITE_URL = 'https://salat10.app';
const QUOTE_WATERMARK = `\n\nShared from ${SITE_NAME} [${SITE_URL}]`;

type Props = {
    quote: Quote;
};

export function QuoteCard({ quote }: Props) {
    const citation = formatCitation(quote);
    const [copied, setCopied] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const handleCopy = useCallback(async () => {
        try {
            const text = `${quote.body} - [${citation}]${QUOTE_WATERMARK}`;
            await Clipboard.setStringAsync(text);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setCopied(true);
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.delay(1200),
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start(() => setCopied(false));
        } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    }, [quote, citation, fadeAnim]);

    const handleOpenUrl = async () => {
        if (!quote.url) return;
        try {
            await Linking.openURL(quote.url);
        } catch {
            // URL could not be opened
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.quoteBody}>
                <Text style={styles.quoteText}>{quote.body}</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.citationContainer}>
                    <Text style={styles.citation}>— {citation}</Text>
                    {quote.url ? (
                        <Pressable onPress={handleOpenUrl} hitSlop={8} accessibilityRole="button" accessibilityLabel="Open source link">
                            <Ionicons name="link-outline" size={14} color={theme.colors.white70} />
                        </Pressable>
                    ) : null}
                </View>

                <View style={styles.copyArea}>
                    {copied && (
                        <Animated.Text style={[styles.copiedLabel, { opacity: fadeAnim }]}>
                            Copied!
                        </Animated.Text>
                    )}
                    <Pressable onPress={handleCopy} hitSlop={8} style={styles.copyButton} accessibilityRole="button" accessibilityLabel="Copy quote to clipboard">
                        <Ionicons
                            name={copied ? 'checkmark-circle' : 'copy-outline'}
                            size={18}
                            color={copied ? theme.colors.green400 : theme.colors.white70}
                        />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius['3xl'],
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.white20,
    },
    quoteBody: {
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.white20,
        paddingLeft: 12,
        marginBottom: theme.spacing.md,
    },
    quoteText: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.base,
        lineHeight: 24,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    citationContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginRight: theme.spacing.sm,
    },
    citation: {
        color: theme.colors.white70,
        fontSize: theme.fontSize.sm,
        flexShrink: 1,
    },
    copyArea: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    copiedLabel: {
        color: theme.colors.green400,
        fontSize: theme.fontSize.xs,
        fontWeight: '600',
    },
    copyButton: {
        padding: 8,
    },
});
