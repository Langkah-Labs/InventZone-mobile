package io.ionic.starter;

import android.nfc.FormatException;
import android.nfc.Tag;
import android.nfc.tech.Ndef;
import android.nfc.tech.NdefFormatable;

import java.util.Arrays;
import java.util.List;

public class WritableTag {

    private final static String NDEF = Ndef.class.getCanonicalName();
    private final static String NDEF_FORMATABLE = NdefFormatable.class.getCanonicalName();

    private Ndef ndef;
    private NdefFormatable ndefFormatable;

    public WritableTag(Tag tag) throws FormatException {
        String[] technologies = tag.getTechList();
        List<String> tagTechs = Arrays.asList(technologies);
        if (tagTechs.contains(NDEF)) {
            ndef = Ndef.get(tag);
            ndefFormatable = null;
        } else if (tagTechs.contains(NDEF_FORMATABLE)) {
            ndefFormatable = NdefFormatable.get(tag);
            ndef = null;
        } else {
            throw new FormatException("Tag doesn't support ndef");
        }
    }

    public String byteToHexString(byte[] src) {
        if (isNullOrEmpty(src)) {
            return null;
        }

        StringBuilder sb = new StringBuilder();
        for (byte b : src) {
            sb.append(String.format("%02X", b));
        }

        return sb.toString();
    }

    public String getTagId() {
        if (ndef != null) {
            return byteToHexString(ndef.getTag().getId());
        } else if (ndefFormatable != null) {
            return byteToHexString(ndefFormatable.getTag().getId());
        }

        return null;
    }

    private Boolean isNullOrEmpty(byte[] arr) {
        if (arr == null) {
            return true;
        }

        int length = arr.length;
        for (byte value : arr) {
            if ((int) value != 0) {
                return false;
            }
        }

        return true;
    }
}
