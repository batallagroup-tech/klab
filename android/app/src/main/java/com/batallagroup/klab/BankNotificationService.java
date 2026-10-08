package com.batallagroup.klab;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BankNotificationService extends NotificationListenerService {
    private static final String TAG = "KlabBankDetector";

    // Patrones de montos en pesos: $150.00, $ 1,500, 250.00 MXN, etc.
    private static final Pattern AMOUNT_PATTERN = Pattern.compile(
        "(?:\\$\\s*|MXN\\s*|pesos\\s*|monto[:\\s]*\\$?\\s*)([0-9]{1,3}(?:,[0-9]{3})*(?:\\.[0-9]{1,2})?|[0-9]+(?:\\.[0-9]{1,2})?)",
        Pattern.CASE_INSENSITIVE
    );

    // Palabras clave de depósitos o transferencias recibidas
    private static final String[] DEPOSIT_KEYWORDS = {
        "depósito", "deposito", "transferencia", "recibiste", "te enviaron",
        "te transfirieron", "pago recibido", "abono", "spei", "recibido",
        "ingreso", "recibiste un depósito", "dinero recibido"
    };

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null || sbn.getNotification() == null) return;

        try {
            String packageName = sbn.getPackageName() != null ? sbn.getPackageName().toLowerCase() : "";
            Notification notification = sbn.getNotification();
            Bundle extras = notification.extras;

            if (extras == null) return;

            CharSequence titleSeq = extras.getCharSequence(Notification.EXTRA_TITLE);
            CharSequence textSeq = extras.getCharSequence(Notification.EXTRA_TEXT);
            CharSequence bigTextSeq = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);

            String title = titleSeq != null ? titleSeq.toString() : "";
            String text = textSeq != null ? textSeq.toString() : "";
            String bigText = bigTextSeq != null ? bigTextSeq.toString() : "";

            String fullText = (title + " " + text + " " + bigText).toLowerCase();

            // Detectar banco emisor
            String bankName = identifyBank(packageName, fullText);

            // Verificar si contiene palabras clave de depósito/SPEI
            boolean isDeposit = false;
            for (String kw : DEPOSIT_KEYWORDS) {
                if (fullText.contains(kw)) {
                    isDeposit = true;
                    break;
                }
            }

            if (!isDeposit && bankName.equals("Desconocido")) {
                return;
            }

            // Extraer monto
            double amount = extractAmount(title + " " + text + " " + bigText);

            if (amount > 0) {
                Log.d(TAG, "¡Depósito bancario detectado! Banco: " + bankName + ", Monto: $" + amount);
                BankNotificationPlugin.onPaymentReceived(amount, bankName, title, text);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error procesando notificación bancaria", e);
        }
    }

    private String identifyBank(String pkg, String content) {
        if (pkg.contains("bbva") || content.contains("bbva")) return "BBVA México";
        if (pkg.contains("nu.") || content.contains("nu méxico") || content.contains("nu mexico") || content.contains("cuenta nu")) return "Nu México";
        if (pkg.contains("mercadopago") || content.contains("mercado pago")) return "Mercado Pago";
        if (pkg.contains("banorte") || content.contains("banorte")) return "Banorte";
        if (pkg.contains("santander") || content.contains("santander")) return "Santander";
        if (pkg.contains("banamex") || content.contains("citibanamex")) return "Citibanamex";
        if (pkg.contains("hsbc") || content.contains("hsbc")) return "HSBC";
        if (pkg.contains("azteca") || content.contains("banco azteca")) return "Banco Azteca";
        if (pkg.contains("heybanco") || content.contains("hey banco")) return "Hey Banco";
        if (pkg.contains("spinbyoxxo") || content.contains("spin by oxxo") || content.contains("spin")) return "Spin by OXXO";
        if (pkg.contains("klar") || content.contains("klar")) return "Klar";
        if (pkg.contains("fondeadora") || content.contains("fondeadora")) return "Fondeadora";
        if (pkg.contains("stp") || content.contains("stp")) return "STP";
        if (pkg.contains("scotiabank") || content.contains("scotiabank")) return "Scotiabank";
        if (pkg.contains("inbursa") || content.contains("inbursa")) return "Inbursa";
        if (pkg.contains("afirme") || content.contains("afirme")) return "Afirme";
        if (pkg.contains("banregio") || content.contains("banregio")) return "Banregio";
        if (pkg.contains("uala") || content.contains("ualá")) return "Ualá";
        if (pkg.contains("albo") || content.contains("albo")) return "Albo";
        return "Banco / SPEI";
    }

    private double extractAmount(String text) {
        Matcher matcher = AMOUNT_PATTERN.matcher(text);
        if (matcher.find()) {
            try {
                String match = matcher.group(1);
                if (match != null) {
                    match = match.replace(",", "").trim();
                    return Double.parseDouble(match);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error parseando monto", e);
            }
        }
        return 0.0;
    }
}
